import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

export default function DashboardLoading() {
  return (
    <Box role="status" aria-label="Loading dashboard">
      <Skeleton variant="text" width={220} height={44} />
      <Skeleton variant="text" width={360} sx={{ mb: 3 }} />
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {Array.from({ length: 4 }, (_, i) => (
          <Grid key={i} size={{ xs: 6, lg: 3 }}>
            <Skeleton variant="rounded" height={90} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Skeleton variant="rounded" height={420} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Skeleton variant="rounded" height={420} />
        </Grid>
      </Grid>
    </Box>
  );
}
