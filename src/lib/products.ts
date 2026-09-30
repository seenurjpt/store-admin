import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { ProductQuery } from "@/lib/product-query";
import { LOW_STOCK_THRESHOLD } from "@/lib/stock";
import type { Prisma } from "@/generated/prisma/client";
import type { ProductStatus } from "@/generated/prisma/enums";

// Prisma returns prices as Decimal, which can't be passed to Client Components,
// so everything leaving this module uses plain numbers.

export type Category = { id: string; name: string; slug: string };

export type ProductListItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  createdAt: Date;
  category: Category;
};

export type ProductDetails = ProductListItem & {
  description: string;
  updatedAt: Date;
  createdBy: string | null;
};

const listSelect = {
  id: true,
  name: true,
  imageUrl: true,
  price: true,
  stock: true,
  status: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductSelect;

type ListRow = Prisma.ProductGetPayload<{ select: typeof listSelect }>;

function toListItem(row: ListRow): ProductListItem {
  return { ...row, price: row.price.toNumber() };
}

export async function listProducts(query: ProductQuery) {
  const where: Prisma.ProductWhereInput = {
    ...(query.search && { name: { contains: query.search, mode: "insensitive" } }),
    ...(query.status !== "all" && { status: query.status === "active" ? "ACTIVE" : "INACTIVE" }),
    ...(query.category !== "all" && { category: { slug: query.category } }),
  };

  const total = await db.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, pageCount);

  const rows = await db.product.findMany({
    where,
    select: listSelect,
    // The id tie-breaker keeps pagination stable when sort values are equal.
    orderBy: [{ [query.sort]: query.order }, { id: "asc" }],
    skip: (page - 1) * query.pageSize,
    take: query.pageSize,
  });

  return { products: rows.map(toListItem), total, page, pageCount };
}

// Cached per request: the product page and its generateMetadata both need it.
export const getProduct = cache(async (id: string): Promise<ProductDetails | null> => {
  const row = await db.product.findUnique({
    where: { id },
    select: {
      ...listSelect,
      description: true,
      updatedAt: true,
      createdBy: { select: { name: true } },
    },
  });
  if (!row) return null;

  return { ...row, price: row.price.toNumber(), createdBy: row.createdBy?.name ?? null };
});

export async function getCategories(): Promise<Category[]> {
  return db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
}

export async function getDashboardStats() {
  const [total, active, stock, recent, lowStock] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.product.aggregate({ _sum: { stock: true } }),
    db.product.findMany({ select: listSelect, orderBy: { createdAt: "desc" }, take: 5 }),
    db.product.findMany({
      where: { status: "ACTIVE", stock: { lte: LOW_STOCK_THRESHOLD } },
      select: listSelect,
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      take: 5,
    }),
  ]);

  return {
    totalProducts: total,
    activeProducts: active,
    inactiveProducts: total - active,
    totalStock: stock._sum.stock ?? 0,
    recentProducts: recent.map(toListItem),
    lowStockProducts: lowStock.map(toListItem),
  };
}
