"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import { setProductStatus } from "@/app/actions/products";
import type { ProductStatus } from "@/generated/prisma/enums";

type Props = {
  product: { id: string; name: string; status: ProductStatus };
  iconOnly?: boolean;
};

export function ChangeStatusButton({ product, iconOnly = false }: Props) {
  const [pending, startTransition] = useTransition();

  const nextStatus: ProductStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const label = nextStatus === "ACTIVE" ? "Activate" : "Deactivate";

  function handleClick() {
    startTransition(async () => {
      const result = await setProductStatus(product.id, nextStatus);
      if (result.ok) {
        toast.success(`${product.name} is now ${nextStatus === "ACTIVE" ? "active" : "inactive"}.`);
      } else {
        toast.error(result.error);
      }
    });
  }

  if (iconOnly) {
    return (
      <Tooltip title={label}>
        <span>
          <IconButton
            aria-label={`${label} ${product.name}`}
            onClick={handleClick}
            disabled={pending}
            size="small"
            sx={{ color: product.status === "ACTIVE" ? "success.main" : "grey.500" }}
          >
            {product.status === "ACTIVE" ? <ToggleOnOutlinedIcon /> : <ToggleOffOutlinedIcon />}
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Button variant="outlined" onClick={handleClick} loading={pending}>
      {label}
    </Button>
  );
}
