import Chip from "@mui/material/Chip";
import type { ProductStatus } from "@/generated/prisma/enums";
import { stockLevel } from "@/lib/stock";
import { DARK, tint } from "@/lib/tint";

export function StatusBadge({ status }: { status: ProductStatus }) {
  const active = status === "ACTIVE";
  return (
    <Chip
      size="small"
      label={active ? "Active" : "Inactive"}
      sx={{
        ...(active
          ? { bgcolor: tint("success"), color: "success.main" }
          : { bgcolor: "action.selected", color: "grey.600", [DARK]: { color: "grey.300" } }),
        "&::before": { content: '""', width: 6, height: 6, ml: 1, borderRadius: "50%", bgcolor: "currentColor" },
        "& .MuiChip-label": { pl: 0.75 },
      }}
    />
  );
}

/** Only rendered when stock needs attention. */
export function StockBadge({ stock, showCount = false }: { stock: number; showCount?: boolean }) {
  const level = stockLevel(stock);
  if (level === "ok") return null;

  const label = level === "out" ? "Out of stock" : showCount ? `${stock} left` : "Low stock";
  const color = level === "out" ? "error" : "warning";
  return <Chip size="small" label={label} sx={{ bgcolor: tint(color), color: `${color}.main` }} />;
}
