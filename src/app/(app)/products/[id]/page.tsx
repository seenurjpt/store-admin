import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getProduct } from "@/lib/products";
import { formatDateTime, formatNumber, formatPrice } from "@/lib/format";
import { getTimeZone } from "@/lib/request-time-zone";
import { StatusBadge, StockBadge } from "@/components/products/badges";
import { ChangeStatusButton } from "@/components/products/change-status-button";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { categorySx, ProductAvatar } from "@/components/products/product-avatar";

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return { title: product?.name ?? "Product not found" };
}

function DetailList({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <Box component="dl" sx={{ m: 0, px: 2.5 }}>
      {rows.map((row) => (
        <Box
          key={row.label}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            py: 1.75,
            borderBottom: 1,
            borderColor: "divider",
            "&:last-of-type": { borderBottom: 0 },
          }}
        >
          <Typography component="dt" variant="body2" color="text.secondary" sx={{ flexShrink: 0, whiteSpace: "nowrap" }}>
            {row.label}
          </Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600, textAlign: "right" }}>
            {row.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const user = await requireUser();
  const [product, timeZone] = await Promise.all([getProduct((await params).id), getTimeZone()]);
  if (!product) notFound();

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Button href="/products" startIcon={<ArrowBackIcon />} sx={{ mb: 2, color: "text.secondary" }}>
        Back to products
      </Button>

      <Stack direction={{ xs: "column", md: "row" }} sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" }, gap: 2, mb: 3 }}>
        <div>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: "1.75rem", md: "2rem" } }}>
            {product.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}>
            <Chip size="small" label={product.category.name} sx={categorySx(product.category.slug)} />
            <StatusBadge status={product.status} />
            <StockBadge stock={product.stock} />
          </Stack>
        </div>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 1.5 }}>
          <Button href={`/products/${product.id}/edit`} variant="contained" startIcon={<EditOutlinedIcon />}>
            Edit
          </Button>
          <ChangeStatusButton product={product} />
          {can(user.role, "product:delete") && <DeleteProductButton product={product} redirectTo="/products" />}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <ProductAvatar product={product} alt={product.name} size="banner" />
            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
              <Typography variant="subtitle1" component="h2">
                Description
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-line" }}>
                {product.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Beside the image on wide screens; below it (side by side on tablets) otherwise. */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: "grid", gap: 3, alignItems: "start", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr" } }}>
            <Card>
              <CardHeader title="Pricing & inventory" slotProps={{ title: { component: "h2" } }} />
              <Divider />
              <DetailList
                rows={[
                  {
                    label: "Price",
                    value: (
                      <Box component="span" sx={{ color: "primary.main", fontSize: "1.125rem" }}>
                        {formatPrice(product.price)}
                      </Box>
                    ),
                  },
                  { label: "Stock", value: `${formatNumber(product.stock)} units` },
                  { label: "Category", value: product.category.name },
                ]}
              />
            </Card>
            <Card>
              <CardHeader title="History" slotProps={{ title: { component: "h2" } }} />
              <Divider />
              <DetailList
                rows={[
                  { label: "Created by", value: product.createdBy ?? "—" },
                  { label: "Created", value: formatDateTime(product.createdAt, timeZone) },
                  { label: "Last updated", value: formatDateTime(product.updatedAt, timeZone) },
                ]}
              />
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
