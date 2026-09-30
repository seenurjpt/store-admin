import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { tint } from "@/lib/tint";

export default function NotFound() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", p: 3 }}>
      <div>
        <Box
          aria-hidden="true"
          sx={{ width: 56, height: 56, mx: "auto", mb: 2, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: tint("primary"), color: "primary.main" }}
        >
          <SearchOffOutlinedIcon />
        </Box>
        <Typography variant="h5" component="h1">
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </Typography>
        <Button href="/dashboard" variant="contained" sx={{ mt: 3 }}>
          Go to dashboard
        </Button>
      </div>
    </Box>
  );
}
