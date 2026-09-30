import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

export function Brand({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Box
        aria-hidden="true"
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          color: "#ffffff",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        }}
      >
        <StorefrontOutlinedIcon fontSize="small" />
      </Box>
      <Typography
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: 17,
          whiteSpace: "nowrap",
          color: inverted ? "#ffffff" : "text.primary",
          ...(compact && { display: "none" }),
        }}
      >
        Store Admin
      </Typography>
    </Box>
  );
}
