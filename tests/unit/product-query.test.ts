import { describe, expect, it } from "vitest";
import { DEFAULT_QUERY, hasActiveFilters, parseProductQuery, productQueryString } from "@/lib/product-query";

describe("parseProductQuery", () => {
  it("uses defaults when nothing is provided", () => {
    expect(parseProductQuery({})).toEqual({
      search: "",
      status: "all",
      category: "all",
      sort: "createdAt",
      order: "desc",
      page: 1,
      pageSize: 10,
    });
  });

  it("reads valid values from the URL", () => {
    expect(
      parseProductQuery({ search: " pizza ", status: "active", category: "food", sort: "price", order: "asc", page: "2", pageSize: "20" }),
    ).toEqual({ search: "pizza", status: "active", category: "food", sort: "price", order: "asc", page: 2, pageSize: 20 });
  });

  it("falls back to defaults for invalid values instead of failing", () => {
    const query = parseProductQuery({ status: "deleted", sort: "password", order: "sideways", page: "-3" });
    expect(query.status).toBe("all");
    expect(query.sort).toBe("createdAt");
    expect(query.order).toBe("desc");
    expect(query.page).toBe(1);
    expect(parseProductQuery({ page: "abc" }).page).toBe(1);
  });

  it("only allows the offered page sizes", () => {
    expect(parseProductQuery({ pageSize: "50" }).pageSize).toBe(50);
    expect(parseProductQuery({ pageSize: "1000" }).pageSize).toBe(10);
    expect(parseProductQuery({ pageSize: "abc" }).pageSize).toBe(10);
  });

  it("uses the first value when a parameter is repeated", () => {
    expect(parseProductQuery({ status: ["inactive", "active"] }).status).toBe("inactive");
  });
});

describe("productQueryString", () => {
  it("omits default values", () => {
    expect(productQueryString(DEFAULT_QUERY)).toBe("");
  });

  it("keeps search, filters and page together", () => {
    const query = parseProductQuery({ search: "pizza", status: "active" });
    expect(productQueryString(query, { page: 2 })).toBe("?search=pizza&status=active&page=2");
    expect(productQueryString(query, { pageSize: 20 })).toBe("?search=pizza&status=active&pageSize=20");
  });
});

describe("hasActiveFilters", () => {
  it("ignores sorting and pagination", () => {
    expect(hasActiveFilters(parseProductQuery({ sort: "name", page: "3" }))).toBe(false);
    expect(hasActiveFilters(parseProductQuery({ category: "food" }))).toBe(true);
  });
});
