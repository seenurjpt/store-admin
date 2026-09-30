import { updateProduct } from "@/app/actions/products";
import { requireUser } from "@/lib/auth";
import { getCategories, getProduct } from "@/lib/products";
import { ProductForm } from "@/components/products/product-form";
import { ProductNotFoundDialog } from "@/components/products/product-not-found-dialog";

// Intercepts /products/[id]/edit on client-side navigation and shows the form in a dialog.
// Opening the URL directly (or refreshing) renders the full page in products/[id]/edit instead.
export default async function EditProductModal({ params }: PageProps<"/products/[id]/edit">) {
  await requireUser();
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);
  if (!product) return <ProductNotFoundDialog />;

  return (
    <ProductForm
      variant="dialog"
      title="Edit product"
      description={product.name}
      action={updateProduct.bind(null, product.id)}
      categories={categories}
      product={product}
      submitLabel="Save changes"
      successMessage="Changes saved"
    />
  );
}
