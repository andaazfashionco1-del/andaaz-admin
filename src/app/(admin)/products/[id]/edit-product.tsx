"use client";

import { useParams } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";
import { ErrorState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useProduct } from "@/lib/queries";

export function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useProduct(id);

  if (isLoading) return <Spinner />;
  if (error || !data) return <ErrorState error={error} onRetry={() => void refetch()} />;
  return <ProductForm key={data.id} product={data} />;
}
