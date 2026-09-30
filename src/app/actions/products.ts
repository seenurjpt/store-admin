"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import {
  productSchema,
  productStatusSchema,
  readProductForm,
  type ProductField,
  type ProductFormValues,
  type ProductInput,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export type ProductFormErrors = {
  message?: string;
  errors?: Partial<Record<ProductField, string[]>>;
  values?: ProductFormValues;
};

/** Create/update don't redirect themselves; the form shows a toast and navigates on success. */
export type SaveProductResult = { ok: true; productId: string } | ({ ok: false } & ProductFormErrors);

export type ActionResult = { ok: true } | { ok: false; error: string };

const SAVE_FAILED = "Something went wrong while saving the product. Please try again.";
const PRODUCT_GONE = "This product no longer exists. It may have been deleted.";

type ValidationResult = { ok: true; data: ProductInput } | { ok: false; state: ProductFormErrors };

async function validateProduct(values: ProductFormValues): Promise<ValidationResult> {
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, state: { errors: z.flattenError(parsed.error).fieldErrors, values } };
  }

  const category = await db.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } });
  if (!category) {
    return { ok: false, state: { errors: { categoryId: ["Select a valid category."] }, values } };
  }

  return { ok: true, data: parsed.data };
}

function isRecordNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

function revalidateProducts() {
  revalidatePath("/products", "layout");
  revalidatePath("/dashboard");
}

export async function createProduct(formData: FormData): Promise<SaveProductResult> {
  const user = await requireUser();
  const values = readProductForm(formData);

  if (!can(user.role, "product:create")) {
    return { ok: false, message: "You don't have permission to create products.", values };
  }

  let productId: string;
  try {
    const result = await validateProduct(values);
    if (!result.ok) return { ok: false, ...result.state };

    const product = await db.product.create({
      data: { ...result.data, createdById: user.id },
      select: { id: true },
    });
    productId = product.id;
  } catch (error) {
    console.error("Failed to create product", error);
    return { ok: false, message: SAVE_FAILED, values };
  }

  revalidateProducts();
  return { ok: true, productId };
}

export async function updateProduct(id: string, formData: FormData): Promise<SaveProductResult> {
  const user = await requireUser();
  const values = readProductForm(formData);

  if (!can(user.role, "product:update")) {
    return { ok: false, message: "You don't have permission to edit products.", values };
  }

  try {
    const result = await validateProduct(values);
    if (!result.ok) return { ok: false, ...result.state };

    await db.product.update({ where: { id }, data: result.data });
  } catch (error) {
    if (isRecordNotFound(error)) return { ok: false, message: PRODUCT_GONE, values };
    console.error("Failed to update product", error);
    return { ok: false, message: SAVE_FAILED, values };
  }

  revalidateProducts();
  return { ok: true, productId: id };
}

export async function setProductStatus(id: string, status: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!can(user.role, "product:change-status")) {
    return { ok: false, error: "You don't have permission to change product status." };
  }

  const parsedStatus = productStatusSchema.safeParse(status);
  if (typeof id !== "string" || !parsedStatus.success) {
    return { ok: false, error: "Invalid status change request." };
  }

  try {
    await db.product.update({ where: { id }, data: { status: parsedStatus.data } });
  } catch (error) {
    if (isRecordNotFound(error)) return { ok: false, error: PRODUCT_GONE };
    console.error("Failed to change product status", error);
    return { ok: false, error: "Couldn't update the status. Please try again." };
  }

  revalidateProducts();
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!can(user.role, "product:delete")) {
    return { ok: false, error: "You don't have permission to delete products." };
  }

  if (typeof id !== "string") {
    return { ok: false, error: "Invalid delete request." };
  }

  try {
    await db.product.delete({ where: { id } });
  } catch (error) {
    if (isRecordNotFound(error)) return { ok: false, error: PRODUCT_GONE };
    console.error("Failed to delete product", error);
    return { ok: false, error: "Couldn't delete the product. Please try again." };
  }

  revalidateProducts();
  return { ok: true };
}
