import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import { updateProduct } from "@/app/actions/products";
import { requireUser } from "@/lib/auth";
import { getCategories, getProduct } from "@/lib/products";
import { PageHeader } from "@/components/page-header";
import { ProductForm } from "@/components/products/product-form";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/products/[id]/edit">) {
  await requireUser();
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);
  if (!product) notFound();

  return (
    <Box sx={{ maxWidth: 1040, mx: "auto" }}>
      <PageHeader title="Edit product" description={product.name} />
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        product={product}
        cancelHref={`/products/${product.id}`}
        submitLabel="Save changes"
        successMessage="Changes saved"
      />
    </Box>
  );
}
