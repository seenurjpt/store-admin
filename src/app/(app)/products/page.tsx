import { Suspense } from "react";
import type { Metadata } from "next";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import AddIcon from "@mui/icons-material/Add";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { parseProductQuery } from "@/lib/product-query";
import { getCategories } from "@/lib/products";
import { PageHeader } from "@/components/page-header";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductList } from "@/components/products/product-list";
import { ProductListSkeleton } from "@/components/products/product-list-skeleton";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const user = await requireUser();
  const query = parseProductQuery(await searchParams);
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        title="Products"
        description="Search, filter and manage the products in your store."
        actions={
          <Button href="/products/new" variant="contained" startIcon={<AddIcon />}>
            New product
          </Button>
        }
      />

      <Card>
        <ProductFilters query={query} categories={categories} />

        {/* Keyed by the query so the skeleton shows whenever search, filters, sorting or page change. */}
        <Suspense key={JSON.stringify(query)} fallback={<ProductListSkeleton />}>
          <ProductList query={query} canDelete={can(user.role, "product:delete")} />
        </Suspense>
      </Card>
    </>
  );
}
