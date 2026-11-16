import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { OrderDetail } from "./order-detail";

export const metadata: Metadata = { title: "Order" };

export default function OrderPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <OrderDetail />
    </Suspense>
  );
}
