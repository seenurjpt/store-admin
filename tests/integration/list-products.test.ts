import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { listProducts } from "@/lib/products";
import { parseProductQuery } from "@/lib/product-query";
import { resetDatabase } from "./fixtures";

beforeAll(async () => {
  const { food, drink } = await resetDatabase();

  await db.product.createMany({
    data: [
      { name: "Margherita Pizza", description: "-", price: 12, stock: 20, categoryId: food.id, status: "ACTIVE" },
      { name: "Pepperoni Pizza", description: "-", price: 14, stock: 5, categoryId: food.id, status: "ACTIVE" },
      { name: "Vegetarian Pizza", description: "-", price: 13, stock: 0, categoryId: food.id, status: "INACTIVE" },
      { name: "Pizza Soda", description: "-", price: 3, stock: 40, categoryId: drink.id, status: "ACTIVE" },
      // Filler products to get more than one page.
      ...Array.from({ length: 12 }, (_, i) => ({
        name: `Burger ${String(i + 1).padStart(2, "0")}`,
        description: "-",
        price: 10 + i,
        stock: i,
        categoryId: food.id,
      })),
    ],
  });
});

afterAll(async () => {
  await db.$disconnect();
});

describe("listProducts", () => {
  it("combines search, status and category filters", async () => {
    const result = await listProducts(parseProductQuery({ search: "PIZZA", status: "active", category: "food" }));

    expect(result.total).toBe(2);
    expect(result.products.map((p) => p.name).sort()).toEqual(["Margherita Pizza", "Pepperoni Pizza"]);
  });

  it("sorts by price in both directions", async () => {
    const asc = await listProducts(parseProductQuery({ search: "pizza", sort: "price", order: "asc" }));
    const desc = await listProducts(parseProductQuery({ search: "pizza", sort: "price", order: "desc" }));

    expect(asc.products.map((p) => p.price)).toEqual([3, 12, 13, 14]);
    expect(desc.products.map((p) => p.price)).toEqual([14, 13, 12, 3]);
  });

  it("paginates and keeps filters applied", async () => {
    const page1 = await listProducts(parseProductQuery({ category: "food", sort: "name", order: "asc" }));
    const page2 = await listProducts(parseProductQuery({ category: "food", sort: "name", order: "asc", page: "2" }));

    expect(page1.total).toBe(15);
    expect(page1.pageCount).toBe(2);
    expect(page1.products).toHaveLength(10);
    expect(page2.products).toHaveLength(5);
    expect(page2.products.every((p) => p.category.slug === "food")).toBe(true);
    // No overlap between pages.
    const ids = new Set(page1.products.map((p) => p.id));
    expect(page2.products.some((p) => ids.has(p.id))).toBe(false);
  });

  it("respects the chosen page size", async () => {
    const result = await listProducts(parseProductQuery({ category: "food", pageSize: "20" }));

    expect(result.pageCount).toBe(1);
    expect(result.products).toHaveLength(15);
  });

  it("clamps a page number that is out of range", async () => {
    const result = await listProducts(parseProductQuery({ search: "pizza", page: "99" }));

    expect(result.page).toBe(1);
    expect(result.products).toHaveLength(4);
  });

  it("returns an empty result when nothing matches", async () => {
    const result = await listProducts(parseProductQuery({ search: "sushi" }));

    expect(result.total).toBe(0);
    expect(result.products).toEqual([]);
  });
});
