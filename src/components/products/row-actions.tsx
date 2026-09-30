"use client";

import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { ProductStatus } from "@/generated/prisma/enums";
import { ChangeStatusButton } from "./change-status-button";
import { DeleteProductButton } from "./delete-product-button";

type Props = {
  product: { id: string; name: string; status: ProductStatus };
  canDelete: boolean;
};

// A Client Component because Tooltip clones its child element, which only works reliably
// when that element is created on the client rather than passed in from a Server Component.
export function RowActions({ product, canDelete }: Props) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
      <Tooltip title="Edit">
        <IconButton
          href={`/products/${product.id}/edit`}
          aria-label={`Edit ${product.name}`}
          size="small"
          sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <ChangeStatusButton product={product} iconOnly />
      {canDelete && <DeleteProductButton product={product} iconOnly />}
    </Stack>
  );
}
