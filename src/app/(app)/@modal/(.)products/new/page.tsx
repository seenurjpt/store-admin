import { createProduct } from "@/app/actions/products";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/products";
import { ProductForm } from "@/components/products/product-form";

// Intercepts /products/new on client-side navigation and shows the form in a dialog.
// Opening the URL directly (or refreshing) renders the full page in products/new instead.
export default async function NewProductModal() {
  await requireUser();
  const categories = await getCategories();

  return (
    <ProductForm
      variant="dialog"
      title="New product"
      description="Add a product to the store."
      action={createProduct}
      categories={categories}
      submitLabel="Create product"
      successMessage="Product created"
    />
  );
}
