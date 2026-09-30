"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PAGE_SIZE_OPTIONS, productQueryString, type PageSize, type ProductQuery } from "@/lib/product-query";

type Props = {
  query: ProductQuery;
  page: number;
  pageCount: number;
  total: number;
  first: number;
  last: number;
};

export function ProductPagination({ query, page, pageCount, total, first, last }: Props) {
  const router = useRouter();

  function changePageSize(pageSize: PageSize) {
    router.push(`/products${productQueryString(query, { pageSize, page: 1 })}`, { scroll: false });
  }

  return (
    <Stack
      direction="row"
      sx={{ px: 2, py: 1.5, gap: 2, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", borderTop: 1, borderColor: "divider" }}
    >
      <Stack direction="row" sx={{ gap: { xs: 1.5, sm: 3 }, flexWrap: "wrap", alignItems: "center" }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
          <Typography id="page-size-label" variant="body2" color="text.secondary">
            Rows per page
          </Typography>
          <Select
            labelId="page-size-label"
            size="small"
            value={query.pageSize}
            onChange={(event) => changePageSize(Number(event.target.value) as PageSize)}
            sx={{ "& .MuiSelect-select": { py: 0.5, fontSize: 14 } }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          Showing {first}–{last} of {total} {total === 1 ? "product" : "products"}
        </Typography>
      </Stack>

      {/* Page buttons are real links, so pages can be opened in a new tab and work with the back button. */}
      {pageCount > 1 && (
        <Pagination
          page={page}
          count={pageCount}
          color="primary"
          shape="rounded"
          renderItem={(item) => (
            <PaginationItem {...item} component={Link} href={`/products${productQueryString(query, { page: item.page ?? 1 })}`} />
          )}
        />
      )}
    </Stack>
  );
}
