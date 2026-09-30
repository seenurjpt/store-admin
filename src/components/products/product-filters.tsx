"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import {
  DEFAULT_QUERY,
  hasActiveFilters,
  productQueryString,
  type ProductQuery,
  type SortField,
} from "@/lib/product-query";
import type { Category } from "@/lib/products";

const SEARCH_DEBOUNCE_MS = 300;

const sortOptions: { label: string; sort: SortField; order: ProductQuery["order"] }[] = [
  { label: "Newest first", sort: "createdAt", order: "desc" },
  { label: "Oldest first", sort: "createdAt", order: "asc" },
  { label: "Name (A–Z)", sort: "name", order: "asc" },
  { label: "Name (Z–A)", sort: "name", order: "desc" },
  { label: "Price (low to high)", sort: "price", order: "asc" },
  { label: "Price (high to low)", sort: "price", order: "desc" },
  { label: "Stock (low to high)", sort: "stock", order: "asc" },
  { label: "Stock (high to low)", sort: "stock", order: "desc" },
];

const sortValue = (sort: SortField, order: ProductQuery["order"]) => `${sort}:${order}`;

export function ProductFilters({ query, categories }: { query: ProductQuery; categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Local state keeps typing responsive; it re-syncs when the URL changes from elsewhere
  // (back button, "Products" nav link, clearing filters).
  const [search, setSearch] = useState(query.search);
  const [syncedSearch, setSyncedSearch] = useState(query.search);
  if (query.search !== syncedSearch) {
    setSyncedSearch(query.search);
    setSearch(query.search);
  }

  useEffect(() => () => clearTimeout(debounce.current), []);

  // Any filter change goes back to page 1, since the old page may no longer exist.
  function update(changes: Partial<ProductQuery>) {
    router.replace(`${pathname}${productQueryString(query, { ...changes, page: 1 })}`, { scroll: false });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => update({ search: value.trim() }), SEARCH_DEBOUNCE_MS);
  }

  function handleSortChange(value: string) {
    const option = sortOptions.find((o) => sortValue(o.sort, o.order) === value);
    if (option) update({ sort: option.sort, order: option.order });
  }

  const isDefault =
    !hasActiveFilters(query) && query.sort === DEFAULT_QUERY.sort && query.order === DEFAULT_QUERY.order;

  return (
    <Box
      component="form"
      role="search"
      aria-label="Filter products"
      onSubmit={(event) => {
        event.preventDefault();
        clearTimeout(debounce.current);
        update({ search: search.trim() });
      }}
      sx={{
        p: 2,
        display: "grid",
        gap: 2,
        // Phones: stacked. Tablets: search on its own row. Wide screens: everything on one row.
        gridTemplateColumns: {
          xs: "1fr 1fr",
          md: "repeat(3, minmax(0, 1fr)) auto",
          lg: "minmax(0, 2fr) repeat(3, minmax(0, 1fr)) auto",
        },
        alignItems: "center",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <TextField
        id="search"
        type="search"
        label="Search by name"
        placeholder="e.g. pizza"
        size="small"
        value={search}
        onChange={(event) => handleSearchChange(event.target.value)}
        sx={{ gridColumn: { xs: "1 / -1", lg: "auto" } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        select
        id="status"
        label="Status"
        size="small"
        value={query.status}
        onChange={(event) => update({ status: event.target.value as ProductQuery["status"] })}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </TextField>

      <TextField
        select
        id="category"
        label="Category"
        size="small"
        value={categories.some((c) => c.slug === query.category) ? query.category : "all"}
        onChange={(event) => update({ category: event.target.value })}
      >
        <MenuItem value="all">All</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.slug}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        id="sort"
        label="Sort by"
        size="small"
        value={sortValue(query.sort, query.order)}
        onChange={(event) => handleSortChange(event.target.value)}
        sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}
      >
        {sortOptions.map((option) => (
          <MenuItem key={sortValue(option.sort, option.order)} value={sortValue(option.sort, option.order)}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Button
        onClick={() => router.replace(pathname)}
        disabled={isDefault}
        sx={{ gridColumn: { xs: "1 / -1", md: "auto" }, justifySelf: { xs: "end", md: "auto" } }}
      >
        Reset
      </Button>
    </Box>
  );
}
