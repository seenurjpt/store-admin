import type { Metadata } from "next";
import Box from "@mui/material/Box";
import { createProduct } from "@/app/actions/products";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/products";
import { PageHeader } from "@/components/page-header";
import { ProductForm } from "@/components/products/product-form";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireUser();
  const categories = await getCategories();

  return (
    <Box sx={{ maxWidth: 1040, mx: "auto" }}>
      <PageHeader title="New product" description="Add a product to the store." />
      <ProductForm
        action={createProduct}
        categories={categories}
        cancelHref="/products"
        submitLabel="Create product"
        successMessage="Product created"
      />
    </Box>
  );
}
