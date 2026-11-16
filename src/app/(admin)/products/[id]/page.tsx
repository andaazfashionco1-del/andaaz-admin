import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { EditProduct } from "./edit-product";

export const metadata: Metadata = { title: "Edit product" };

export default function EditProductPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EditProduct />
    </Suspense>
  );
}
