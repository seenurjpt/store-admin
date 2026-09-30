import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { hasActiveFilters, type ProductQuery } from "@/lib/product-query";
import { listProducts, type ProductListItem } from "@/lib/products";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";
import { getTimeZone } from "@/lib/request-time-zone";
import { tint } from "@/lib/tint";
import { StatusBadge, StockBadge } from "./badges";
import { ProductAvatar } from "./product-avatar";
import { ProductPagination } from "./product-pagination";
import { RowActions } from "./row-actions";

function ProductName({ product, stretched = false }: { product: ProductListItem; stretched?: boolean }) {
  return (
    <Link
      href={`/products/${product.id}`}
      underline="none"
      color="text.primary"
      sx={{
        fontWeight: 600,
        transition: "color 150ms",
        // Highlight the name while its row is hovered, so the row reads as clickable.
        "tr:hover &, li:hover &, &:hover": { color: "primary.main" },
        // "Stretched link": makes the whole surrounding row clickable while the link text stays its accessible name.
        ...(stretched && { "&::after": { content: '""', position: "absolute", inset: 0 } }),
      }}
    >
      {product.name}
    </Link>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  const Icon = filtered ? SearchOffOutlinedIcon : Inventory2OutlinedIcon;
  return (
    <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
      <Box
        aria-hidden="true"
        sx={{ width: 56, height: 56, mx: "auto", mb: 2, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: tint("primary"), color: "primary.main" }}
      >
        <Icon />
      </Box>
      <Typography variant="h6" component="p">
        {filtered ? "No products found." : "No products yet."}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
        {filtered ? "Try a different search or adjust the filters." : "Add your first product to start managing the store."}
      </Typography>
      {filtered ? (
        <Button href="/products" sx={{ mt: 2 }}>
          Clear filters
        </Button>
      ) : (
        <Button href="/products/new" variant="contained" startIcon={<AddIcon />} sx={{ mt: 2 }}>
          Create your first product
        </Button>
      )}
    </Box>
  );
}

export async function ProductList({ query, canDelete }: { query: ProductQuery; canDelete: boolean }) {
  const [{ products, total, page, pageCount }, timeZone] = await Promise.all([listProducts(query), getTimeZone()]);

  if (total === 0) return <EmptyState filtered={hasActiveFilters(query)} />;

  const first = (page - 1) * query.pageSize + 1;
  const last = first + products.length - 1;

  return (
    <>
      {/* Wide screens: table. Below 1200px (phones, tablets, small laptops) the list below is used,
          because the table's seven columns no longer fit next to the sidebar. */}
      <TableContainer sx={{ display: { xs: "none", lg: "block" } }}>
        <Table aria-label="Products">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ "& .MuiTableCell-root": { py: 1.25 } }}>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <ProductAvatar product={product} />
                    <ProductName product={product} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: "text.secondary" }}>{product.category.name}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "flex-end" }}>
                    <StockBadge stock={product.stock} />
                    <Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatNumber(product.stock)}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <StatusBadge status={product.status} />
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>{formatDate(product.createdAt, timeZone)}</TableCell>
                <TableCell align="right">
                  <RowActions product={product} canDelete={canDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Narrower screens: one tappable row per product */}
      <Box component="ul" sx={{ display: { xs: "block", lg: "none" }, m: 0, p: 0, listStyle: "none" }}>
        {products.map((product) => (
          <Box
            component="li"
            key={product.id}
            sx={{
              position: "relative",
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              "&:last-of-type": { borderBottom: 0 },
              "&:hover": { bgcolor: tint("primary", 0.06) },
            }}
          >
            <Stack direction="row" spacing={1.5}>
              <ProductAvatar product={product} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <ProductName product={product} stretched />
                <Typography variant="body2" color="text.secondary">
                  {product.category.name} · {formatPrice(product.price)} · {formatNumber(product.stock)} in stock
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                  <StatusBadge status={product.status} />
                  <StockBadge stock={product.stock} />
                </Stack>
              </Box>
            </Stack>
            <Stack direction="row" sx={{ mt: 1, alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">
                Created {formatDate(product.createdAt, timeZone)}
              </Typography>
              {/* Raised above the stretched link so the buttons stay clickable. */}
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <RowActions product={product} canDelete={canDelete} />
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>

      <ProductPagination query={query} page={page} pageCount={pageCount} total={total} first={first} last={last} />
    </>
  );
}
