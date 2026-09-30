import { describe, expect, it } from "vitest";
import * as z from "zod";
import { loginSchema, productSchema, readProductForm } from "@/lib/validation";

const validProduct = {
  name: "Margherita Pizza",
  description: "Classic Italian pizza",
  price: "12.50",
  stock: "20",
  categoryId: "cat_1",
  imageUrl: "",
  status: "ACTIVE",
};

function fieldErrors(input: Record<string, unknown>) {
  const result = productSchema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("productSchema", () => {
  it("accepts a valid product and converts form strings", () => {
    const result = productSchema.parse(validProduct);
    expect(result).toEqual({
      name: "Margherita Pizza",
      description: "Classic Italian pizza",
      price: 12.5,
      stock: 20,
      categoryId: "cat_1",
      imageUrl: null,
      status: "ACTIVE",
    });
  });

  it("requires every mandatory field", () => {
    const errors = fieldErrors({});
    expect(errors.name).toEqual(["Name is required."]);
    expect(errors.description).toEqual(["Description is required."]);
    expect(errors.price).toEqual(["Price is required."]);
    expect(errors.stock).toEqual(["Stock is required."]);
    expect(errors.categoryId).toEqual(["Category is required."]);
    expect(errors.imageUrl).toBeUndefined();
  });

  it("requires a name of at least 3 characters, ignoring surrounding spaces", () => {
    expect(fieldErrors({ ...validProduct, name: "  ab  " }).name).toEqual(["Name must be at least 3 characters."]);
    expect(fieldErrors({ ...validProduct, name: "abc" }).name).toBeUndefined();
  });

  it("rejects a blank description", () => {
    expect(fieldErrors({ ...validProduct, description: "   " }).description).toEqual(["Description is required."]);
  });

  it.each([
    ["0", "Price must be greater than 0."],
    ["-5", "Price must be greater than 0."],
    ["abc", "Price must be a number."],
  ])("rejects price %s", (price, message) => {
    expect(fieldErrors({ ...validProduct, price }).price).toEqual([message]);
  });

  it("accepts zero stock but not negative or fractional stock", () => {
    expect(fieldErrors({ ...validProduct, stock: "0" }).stock).toBeUndefined();
    expect(fieldErrors({ ...validProduct, stock: "-1" }).stock).toEqual(["Stock cannot be negative."]);
    expect(fieldErrors({ ...validProduct, stock: "1.5" }).stock).toEqual(["Stock must be a whole number."]);
  });

  it("only accepts http(s) image URLs when one is provided", () => {
    expect(productSchema.parse({ ...validProduct, imageUrl: "https://example.com/a.png" }).imageUrl).toBe(
      "https://example.com/a.png",
    );
    expect(fieldErrors({ ...validProduct, imageUrl: "not a url" }).imageUrl).toBeDefined();
    expect(fieldErrors({ ...validProduct, imageUrl: "javascript:alert(1)" }).imageUrl).toBeDefined();
  });

  it("only accepts known statuses", () => {
    expect(fieldErrors({ ...validProduct, status: "DELETED" }).status).toEqual(["Select a status."]);
  });
});

describe("loginSchema", () => {
  it("normalises the email", () => {
    expect(loginSchema.parse({ email: "  Admin@Example.com ", password: "x" }).email).toBe("admin@example.com");
  });

  it("rejects an invalid email and empty password", () => {
    const result = loginSchema.safeParse({ email: "nope", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("readProductForm", () => {
  it("reads the product fields and ignores anything else", () => {
    const formData = new FormData();
    formData.set("name", "Pizza");
    formData.set("price", "12");
    formData.set("role", "ADMIN");
    formData.set("imageUrl", new File(["x"], "image.png"));

    expect(readProductForm(formData)).toEqual({ name: "Pizza", price: "12" });
  });
});
