import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Stack direction="row" sx={{ flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mb: 3.5 }}>
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" } }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && <Stack direction="row" spacing={1}>{actions}</Stack>}
    </Stack>
  );
}
