import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { requireUser } from "@/lib/auth";
import { getDashboardStats, type ProductListItem } from "@/lib/products";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";
import { getTimeZone } from "@/lib/request-time-zone";
import { LOW_STOCK_THRESHOLD } from "@/lib/stock";
import { tint } from "@/lib/tint";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, StockBadge } from "@/components/products/badges";
import { ProductAvatar } from "@/components/products/product-avatar";

export const metadata: Metadata = { title: "Dashboard" };

function ProductRow({ product, children }: { product: ProductListItem; children: React.ReactNode }) {
  return (
    <ListItemButton
      href={`/products/${product.id}`}
      divider
      sx={{
        px: 2.5,
        py: 1.25,
        "&:hover": { bgcolor: tint("primary", 0.06) },
        "&:hover .MuiListItemText-primary": { color: "primary.main" },
      }}
    >
      <ListItemAvatar>
        <ProductAvatar product={product} />
      </ListItemAvatar>
      <ListItemText
        primary={product.name}
        secondary={`${product.category.name} · ${formatPrice(product.price)}`}
        slotProps={{ primary: { sx: { fontWeight: 600 } } }}
        sx={{ mr: 2 }}
      />
      {children}
    </ListItemButton>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [stats, timeZone] = await Promise.all([getDashboardStats(), getTimeZone()]);

  // Each card links to the product list, filtered to what it counts.
  const cards = [
    { label: "Total products", value: stats.totalProducts, icon: <Inventory2OutlinedIcon />, color: "primary", href: "/products" },
    { label: "Active products", value: stats.activeProducts, icon: <CheckCircleOutlinedIcon />, color: "success", href: "/products?status=active" },
    { label: "Inactive products", value: stats.inactiveProducts, icon: <PauseCircleOutlinedIcon />, color: "warning", href: "/products?status=inactive" },
    { label: "Total stock", value: stats.totalStock, icon: <WarehouseOutlinedIcon />, color: "info", href: "/products?sort=stock&order=desc" },
  ] as const;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.name}. Here's the current state of the store.`}
        actions={
          <Button href="/products/new" variant="contained" startIcon={<AddIcon />}>
            New product
          </Button>
        }
      />

      <Grid component="section" aria-label="Store statistics" container spacing={2.5} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 6, lg: 3 }}>
            <Card
              sx={{
                height: "100%",
                transition: "border-color 150ms, box-shadow 150ms, transform 150ms",
                "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)", boxShadow: "0 8px 24px rgb(15 23 42 / 0.08)" },
                "&:hover .stat-arrow": { color: "primary.main", transform: "translateX(2px)" },
              }}
            >
              <CardActionArea href={card.href} sx={{ height: "100%" }}>
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 2,
                    p: 2.5,
                    "&:last-child": { pb: 2.5 },
                  }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: 2.5, display: "grid", placeItems: "center", color: `${card.color}.main`, bgcolor: tint(card.color) }}
                  >
                    {card.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Typography variant="h5" component="p">
                      {formatNumber(card.value)}
                    </Typography>
                  </Box>
                  <ChevronRightIcon
                    aria-hidden="true"
                    className="stat-arrow"
                    sx={{ color: "text.disabled", transition: "color 150ms, transform 150ms", display: { xs: "none", sm: "block" } }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card component="section" aria-labelledby="recent-heading" sx={{ height: "100%" }}>
            <CardHeader
              title="Recently created"
              subheader="The latest products added to the store"
              slotProps={{ title: { id: "recent-heading", component: "h2" } }}
              action={
                <Button href="/products" size="small">
                  View all
                </Button>
              }
            />
            <Divider />
            {stats.recentProducts.length === 0 ? (
              <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
                <Typography color="text.secondary">No products yet.</Typography>
                <Button href="/products/new" variant="contained" startIcon={<AddIcon />} sx={{ mt: 2 }}>
                  Create your first product
                </Button>
              </Box>
            ) : (
              <List disablePadding>
                {stats.recentProducts.map((product) => (
                  <ProductRow key={product.id} product={product}>
                    <Stack sx={{ alignItems: "flex-end", gap: 0.5 }}>
                      <StatusBadge status={product.status} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                        {formatDate(product.createdAt, timeZone)}
                      </Typography>
                    </Stack>
                  </ProductRow>
                ))}
              </List>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card component="section" aria-labelledby="low-stock-heading" sx={{ height: "100%" }}>
            <CardHeader
              title="Low stock"
              subheader={`Active products with ${LOW_STOCK_THRESHOLD} or fewer left`}
              slotProps={{ title: { id: "low-stock-heading", component: "h2" } }}
            />
            <Divider />
            {stats.lowStockProducts.length === 0 ? (
              <Box sx={{ py: 6, px: 2, textAlign: "center", color: "success.main" }}>
                <CheckCircleOutlinedIcon />
                <Typography color="text.secondary">All active products are well stocked.</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {stats.lowStockProducts.map((product) => (
                  <ProductRow key={product.id} product={product}>
                    <StockBadge stock={product.stock} showCount />
                  </ProductRow>
                ))}
              </List>
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
