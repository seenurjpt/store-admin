import * as z from "zod";

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export const SORT_FIELDS = ["name", "price", "stock", "createdAt"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

// Invalid or missing values fall back to defaults instead of erroring,
// so a hand-edited URL still renders a sensible list.
const productQuerySchema = z.object({
  search: z.string().trim().max(100).catch(""),
  status: z.enum(["all", "active", "inactive"]).catch("all"),
  category: z.string().trim().min(1).catch("all"),
  sort: z.enum(SORT_FIELDS).catch("createdAt"),
  order: z.enum(["asc", "desc"]).catch("desc"),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().pipe(z.literal([...PAGE_SIZE_OPTIONS])).catch(10),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

export const DEFAULT_QUERY: ProductQuery = productQuerySchema.parse({});

type SearchParams = Record<string, string | string[] | undefined>;

export function parseProductQuery(params: SearchParams): ProductQuery {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  return productQuerySchema.parse({
    search: first(params.search),
    status: first(params.status),
    category: first(params.category),
    sort: first(params.sort),
    order: first(params.order),
    page: first(params.page),
    pageSize: first(params.pageSize),
  });
}

/** Builds a query string for the products page, leaving out values that match the defaults. */
export function productQueryString(query: ProductQuery, changes: Partial<ProductQuery> = {}): string {
  const merged = { ...query, ...changes };
  const params = new URLSearchParams();

  for (const key of Object.keys(DEFAULT_QUERY) as (keyof ProductQuery)[]) {
    const value = merged[key];
    if (value !== DEFAULT_QUERY[key] && value !== "") params.set(key, String(value));
  }

  const result = params.toString();
  return result ? `?${result}` : "";
}

export function hasActiveFilters(query: ProductQuery): boolean {
  return query.search !== "" || query.status !== "all" || query.category !== "all";
}
