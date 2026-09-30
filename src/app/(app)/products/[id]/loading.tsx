import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

export default function ProductLoading() {
  return (
    <Box role="status" aria-label="Loading product" sx={{ maxWidth: 1200, mx: "auto" }}>
      <Skeleton variant="text" width={160} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={48} />
      <Skeleton variant="rounded" width={220} height={24} sx={{ mt: 1, mb: 3 }} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rounded" height={480} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr" } }}>
            <Skeleton variant="rounded" height={210} />
            <Skeleton variant="rounded" height={210} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
