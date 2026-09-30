"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { deleteProduct } from "@/app/actions/products";

type Props = {
  product: { id: string; name: string };
  iconOnly?: boolean;
  /** Where to go after deleting, e.g. when deleting from the product's own page. */
  redirectTo?: string;
};

export function DeleteProductButton({ product, iconOnly = false, redirectTo }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success("Product deleted", { description: product.name });
      // The action revalidates the product pages, so a list re-renders without this product.
      if (redirectTo) router.replace(redirectTo);
    });
  }

  return (
    <>
      {iconOnly ? (
        <Tooltip title="Delete">
          <IconButton
            aria-label={`Delete ${product.name}`}
            onClick={() => setOpen(true)}
            size="small"
            sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
          >
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <Button variant="outlined" color="error" onClick={() => setOpen(true)}>
          Delete
        </Button>
      )}

      <Dialog
        open={open}
        onClose={() => !pending && setOpen(false)}
        aria-labelledby={`delete-title-${product.id}`}
        aria-describedby={`delete-description-${product.id}`}
      >
        <DialogTitle id={`delete-title-${product.id}`}>Delete product?</DialogTitle>
        <DialogContent>
          <DialogContentText id={`delete-description-${product.id}`}>
            <strong>{product.name}</strong> will be permanently deleted. This can&apos;t be undone.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={pending} autoFocus>
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="error" variant="contained" loading={pending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
