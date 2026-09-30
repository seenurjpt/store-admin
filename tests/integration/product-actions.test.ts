import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth";

// Only the Next.js request-scoped pieces are mocked: who is logged in, cache revalidation
// and redirects. Validation, permission checks and database writes run for real.
vi.mock("@/lib/auth", () => ({ requireUser: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

const { requireUser } = await import("@/lib/auth");
const { db } = await import("@/lib/db");
const { createProduct, updateProduct, setProductStatus, deleteProduct } = await import("@/app/actions/products");
const { resetDatabase, productFormData } = await import("./fixtures");

let fixtures: Awaited<ReturnType<typeof resetDatabase>>;

function loginAs(user: CurrentUser) {
  vi.mocked(requireUser).mockResolvedValue(user);
}

function validProduct(overrides: Record<string, string> = {}) {
  return productFormData({
    name: "Hawaiian Pizza",
    description: "Ham and pineapple",
    price: "13.90",
    stock: "12",
    categoryId: fixtures.food.id,
    imageUrl: "",
    status: "ACTIVE",
    ...overrides,
  });
}

async function createTestProduct() {
  return db.product.create({
    data: { name: "Cola", description: "330ml can", price: 3, stock: 50, categoryId: fixtures.drink.id },
  });
}

beforeEach(async () => {
  vi.clearAllMocks();
  fixtures = await resetDatabase();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("createProduct", () => {
  it("saves a valid product and returns its id", async () => {
    loginAs(fixtures.manager);

    const result = await createProduct(validProduct());

    expect(result.ok).toBe(true);
    const product = await db.product.findFirstOrThrow({ where: { name: "Hawaiian Pizza" } });
    expect(result).toEqual({ ok: true, productId: product.id });
    expect(product.price.toNumber()).toBe(13.9);
    expect(product.stock).toBe(12);
    expect(product.status).toBe("ACTIVE");
    expect(product.imageUrl).toBeNull();
    expect(product.createdById).toBe(fixtures.manager.id);
  });

  it("returns field errors and saves nothing when the data is invalid", async () => {
    loginAs(fixtures.admin);

    const result = await createProduct(validProduct({ name: "Hi", price: "0", stock: "-2", imageUrl: "nope" }));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toMatchObject({
      name: ["Name must be at least 3 characters."],
      price: ["Price must be greater than 0."],
      stock: ["Stock cannot be negative."],
    });
    expect(result.errors?.imageUrl).toBeDefined();
    expect(result.values?.name).toBe("Hi");
    expect(await db.product.count()).toBe(0);
  });

  it("rejects a category that doesn't exist", async () => {
    loginAs(fixtures.admin);

    const result = await createProduct(validProduct({ categoryId: "missing" }));

    expect(result).toMatchObject({ ok: false, errors: { categoryId: ["Select a valid category."] } });
    expect(await db.product.count()).toBe(0);
  });
});

describe("updateProduct", () => {
  it("updates an existing product", async () => {
    loginAs(fixtures.manager);
    const product = await createTestProduct();

    const result = await updateProduct(
      product.id,
      validProduct({ name: "Cola Zero", categoryId: fixtures.drink.id, status: "INACTIVE" }),
    );

    expect(result).toEqual({ ok: true, productId: product.id });

    const updated = await db.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updated.name).toBe("Cola Zero");
    expect(updated.status).toBe("INACTIVE");
  });

  it("returns a message when the product no longer exists", async () => {
    loginAs(fixtures.admin);

    const result = await updateProduct("missing-id", validProduct());

    expect(result).toMatchObject({ ok: false, message: expect.stringMatching(/no longer exists/) });
  });
});

describe("setProductStatus", () => {
  it("persists the new status", async () => {
    loginAs(fixtures.manager);
    const product = await createTestProduct();

    expect(await setProductStatus(product.id, "INACTIVE")).toEqual({ ok: true });

    expect((await db.product.findUniqueOrThrow({ where: { id: product.id } })).status).toBe("INACTIVE");
  });

  it("rejects unknown statuses", async () => {
    loginAs(fixtures.admin);
    const product = await createTestProduct();

    expect(await setProductStatus(product.id, "ARCHIVED")).toMatchObject({ ok: false });
    expect((await db.product.findUniqueOrThrow({ where: { id: product.id } })).status).toBe("ACTIVE");
  });
});

describe("deleteProduct", () => {
  it("does not let a manager delete a product", async () => {
    loginAs(fixtures.manager);
    const product = await createTestProduct();

    expect(await deleteProduct(product.id)).toEqual({ ok: false, error: "You don't have permission to delete products." });
    expect(await db.product.count()).toBe(1);
  });

  it("lets an admin delete a product", async () => {
    loginAs(fixtures.admin);
    const product = await createTestProduct();

    expect(await deleteProduct(product.id)).toEqual({ ok: true });
    expect(await db.product.count()).toBe(0);
  });

  it("handles a product that was already deleted", async () => {
    loginAs(fixtures.admin);

    expect(await deleteProduct("missing-id")).toMatchObject({ ok: false, error: expect.stringMatching(/no longer exists/) });
  });
});
