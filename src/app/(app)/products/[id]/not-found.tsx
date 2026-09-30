import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { tint } from "@/lib/tint";

export default function ProductNotFound() {
  return (
    <Card sx={{ py: 8, px: 2, textAlign: "center" }}>
      <Box
        aria-hidden="true"
        sx={{ width: 56, height: 56, mx: "auto", mb: 2, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: tint("primary"), color: "primary.main" }}
      >
        <SearchOffOutlinedIcon />
      </Box>
      <Typography variant="h5" component="h1">
        Product not found
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        This product doesn&apos;t exist or has been deleted.
      </Typography>
      <Button href="/products" variant="contained" sx={{ mt: 3 }}>
        Back to products
      </Button>
    </Card>
  );
}
