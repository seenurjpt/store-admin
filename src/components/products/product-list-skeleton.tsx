import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export function ProductListSkeleton() {
  return (
    <Box role="status" aria-label="Loading products" sx={{ p: 2 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <Stack key={i} direction="row" spacing={2} sx={{ alignItems: "center", py: 1.25 }}>
          <Skeleton variant="rounded" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="25%" />
          </Box>
          <Skeleton variant="rounded" width={72} height={24} />
        </Stack>
      ))}
    </Box>
  );
}
