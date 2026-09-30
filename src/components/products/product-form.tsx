"use client";

import { useActionState, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import type { SaveProductResult } from "@/app/actions/products";
import type { Category, ProductDetails } from "@/lib/products";
import { productSchema, readProductForm, type ProductField, type ProductFormValues } from "@/lib/validation";

type Props = {
  action: (formData: FormData) => Promise<SaveProductResult>;
  categories: Category[];
  product?: ProductDetails;
  submitLabel: string;
  successMessage: string;
} & (
  | { variant?: "page"; cancelHref: string }
  // Opened over the current page by an intercepted route; closing it goes back in history.
  | { variant: "dialog"; title: string; description?: string }
);

function initialValues(product?: ProductDetails): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    stock: product ? String(product.stock) : "",
    categoryId: product?.category.id ?? "",
    imageUrl: product?.imageUrl ?? "",
    status: product?.status ?? "ACTIVE",
  };
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Grid container spacing={{ xs: 2, md: 4 }} sx={{ p: { xs: 2.5, md: 3 } }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="subtitle1" component="h2">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={2.5}>{children}</Stack>
      </Grid>
    </Grid>
  );
}

export function ProductForm(props: Props) {
  const { action, categories, product, submitLabel, successMessage } = props;
  const router = useRouter();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
  const titleId = useId();

  const [state, formAction, pending] = useActionState(async (_prev: SaveProductResult | undefined, formData: FormData) => {
    // Validate in the browser first for instant feedback. The Server Action validates again
    // with the same schema, because anything sent from the browser can't be trusted.
    const values = readProductForm(formData);
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      return { ok: false as const, errors: z.flattenError(parsed.error).fieldErrors, values };
    }

    const result = await action(formData);
    if (result.ok) {
      toast.success(successMessage, { description: String(formData.get("name") ?? "") });
      if (props.variant !== "dialog") {
        router.push(`/products/${result.productId}`);
      } else if (product) {
        // Edited in a dialog: close it and stay on the page underneath, which the action revalidated.
        router.back();
      } else {
        // Created in a dialog: open the new product. Replacing keeps "back" from reopening the dialog.
        router.replace(`/products/${result.productId}`);
      }
    }
    return result;
  }, undefined);

  const failed = state?.ok === false ? state : undefined;

  // After a failed submit, show what the user entered rather than the original values.
  const values = failed?.values ?? initialValues(product);
  const fieldProps = (name: ProductField) => ({
    id: name,
    name,
    defaultValue: values[name],
    error: !!failed?.errors?.[name],
    helperText: failed?.errors?.[name]?.[0],
  });

  // Only used for the live preview; the input itself stays uncontrolled.
  const [imageUrl, setImageUrl] = useState(values.imageUrl ?? "");
  const previewSrc = /^https?:\/\/\S+$/i.test(imageUrl.trim()) ? imageUrl.trim() : undefined;

  const errorAlert = failed?.message && <Alert severity="error">{failed.message}</Alert>;

  const nameField = <TextField label="Name" required placeholder="e.g. Margherita Pizza" {...fieldProps("name")} />;
  const descriptionField = (
    <TextField
      label="Description"
      required
      multiline
      minRows={3}
      placeholder="What should staff know about this product?"
      {...fieldProps("description")}
    />
  );

  const pricingFields = (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
      <TextField
        label="Price"
        type="number"
        required
        placeholder="0.00"
        fullWidth
        {...fieldProps("price")}
        slotProps={{
          input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          htmlInput: { min: 0.01, step: 0.01, inputMode: "decimal" },
        }}
      />
      <TextField
        label="Stock"
        type="number"
        required
        placeholder="0"
        fullWidth
        {...fieldProps("stock")}
        slotProps={{
          input: { endAdornment: <InputAdornment position="end">units</InputAdornment> },
          htmlInput: { min: 0, step: 1, inputMode: "numeric" },
        }}
      />
    </Stack>
  );

  const organizationFields = (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
      <TextField
        select
        label="Category"
        required
        fullWidth
        {...fieldProps("categoryId")}
        slotProps={{
          select: {
            displayEmpty: true,
            renderValue: (value) =>
              categories.find((category) => category.id === value)?.name ?? (
                <Box component="span" sx={{ color: "text.disabled" }}>
                  Select a category
                </Box>
              ),
          },
        }}
      >
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField select label="Status" required fullWidth {...fieldProps("status")}>
        <MenuItem value="ACTIVE">Active</MenuItem>
        <MenuItem value="INACTIVE">Inactive</MenuItem>
      </TextField>
    </Stack>
  );

  // The dialog has no section descriptions, so its image field says it's optional itself.
  const dialog = props.variant === "dialog";
  const previewSize = dialog ? 56 : 88;
  const imageFields = (
    <Stack direction={dialog ? "row" : { xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "flex-start" }}>
      <Avatar
        variant="rounded"
        src={previewSrc}
        alt="Image preview"
        slotProps={{ img: { referrerPolicy: "no-referrer" } }}
        sx={{ width: previewSize, height: previewSize, flexShrink: 0, borderRadius: 2, bgcolor: "action.hover", color: "text.disabled" }}
      >
        <ImageOutlinedIcon />
      </Avatar>
      <TextField
        label="Image URL"
        type="url"
        placeholder="https://…"
        fullWidth
        {...fieldProps("imageUrl")}
        onChange={(event) => setImageUrl(event.target.value)}
        helperText={
          failed?.errors?.imageUrl?.[0] ??
          (dialog ? "Optional. A preview appears when the link is valid." : "A preview appears here when the link is valid.")
        }
      />
    </Stack>
  );

  const submitButton = (
    <Button type="submit" variant="contained" loading={pending}>
      {submitLabel}
    </Button>
  );

  if (props.variant === "dialog") {
    const close = () => {
      if (!pending) router.back();
    };

    return (
      <Dialog
        open
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreen}
        // Clicking the backdrop by accident shouldn't throw away what was typed; Esc and Cancel still close.
        onClose={(_event, reason) => reason !== "backdropClick" && close()}
        aria-labelledby={titleId}
      >
        <Box
          component="form"
          action={formAction}
          noValidate
          sx={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}
        >
          <DialogTitle id={titleId} sx={{ pr: 7 }}>
            {props.title}
            {props.description && (
              <Typography component="span" variant="body2" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                {props.description}
              </Typography>
            )}
          </DialogTitle>
          <IconButton aria-label="Close" onClick={close} disabled={pending} sx={{ position: "absolute", top: 12, right: 12 }}>
            <CloseIcon />
          </IconButton>

          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {errorAlert}
              {nameField}
              {descriptionField}
              {pricingFields}
              {organizationFields}
              {imageFields}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={close} disabled={pending} color="inherit">
              Cancel
            </Button>
            {submitButton}
          </DialogActions>
        </Box>
      </Dialog>
    );
  }

  return (
    <Card component="form" action={formAction} noValidate>
      {errorAlert && <Box sx={{ mx: { xs: 2.5, md: 3 }, mt: { xs: 2.5, md: 3 } }}>{errorAlert}</Box>}

      <Section title="Basic information" description="The name and description shown to your team.">
        {nameField}
        {descriptionField}
      </Section>
      <Divider />

      <Section title="Pricing & inventory" description="Price in US dollars and the number of units in stock.">
        {pricingFields}
      </Section>
      <Divider />

      <Section title="Organization" description="Group the product and choose whether it is active in the store.">
        {organizationFields}
      </Section>
      <Divider />

      <Section title="Image" description="Optional. Paste a link to a product photo.">
        {imageFields}
      </Section>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ px: { xs: 2.5, md: 3 }, py: 2, justifyContent: "flex-end", borderTop: 1, borderColor: "divider", bgcolor: "action.hover" }}
      >
        <Button href={props.cancelHref} disabled={pending} color="inherit">
          Cancel
        </Button>
        {submitButton}
      </Stack>
    </Card>
  );
}
