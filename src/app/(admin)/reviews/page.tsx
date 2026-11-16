import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ReviewsView } from "./reviews-view";

export const metadata: Metadata = { title: "Reviews" };

export default function ReviewsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ReviewsView />
    </Suspense>
  );
}
