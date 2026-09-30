"use client";

import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

/** Shown instead of the edit dialog when the product was deleted in the meantime. */
export function ProductNotFoundDialog() {
  const router = useRouter();
  const close = () => router.back();

  return (
    <Dialog open onClose={close} aria-labelledby="product-not-found-title" aria-describedby="product-not-found-description">
      <DialogTitle id="product-not-found-title">Product not found</DialogTitle>
      <DialogContent>
        <DialogContentText id="product-not-found-description">
          This product doesn&apos;t exist or has been deleted.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} variant="contained" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
