"use client";

import { MessageSquare } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ReplyForm } from "@/components/reviews/reply-form";
import { ReviewCard } from "@/components/reviews/review-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/format";
import { type ReviewFilters, useDeleteReview, useReviews, useUpdateReview } from "@/lib/queries";
import type { Review } from "@/lib/types";

export function ReviewsView() {
  // `?search=` lets other pages (e.g. product edit) deep-link into a filtered list.
  const initialSearch = useSearchParams().get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<NonNullable<ReviewFilters["status"]>>("");
  const [rating, setRating] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching, error, refetch } = useReviews({
    status,
    rating,
    search: debouncedSearch,
    page,
    limit: 20,
  });
  const update = useUpdateReview();
  const remove = useDeleteReview();
  const [replying, setReplying] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState<Review | null>(null);

  const toggleVisible = (review: Review, isApproved: boolean) =>
    update.mutate(
      { id: review.id, data: { isApproved } },
      { onSuccess: () => toast.success(isApproved ? "Review is now visible" : "Review hidden from the store") },
    );

  const filtered = Boolean(status || rating || search);

  return (
    <>
      <PageHeader
        title="Reviews"
        description={data ? `${data.total} review${data.total === 1 ? "" : "s"}` : "Moderate customer reviews."}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          label="Filter by visibility"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All" },
            { value: "visible", label: "Visible" },
            { value: "hidden", label: "Hidden" },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchInput
            label="Search reviews"
            placeholder="Product, customer, text…"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <Select
            aria-label="Filter by rating"
            value={String(rating)}
            onChange={(e) => {
              setRating(e.target.value ? Number(e.target.value) : "");
              setPage(1);
            }}
            className="sm:w-40"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} star{r === 1 ? "" : "s"}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data?.items.length ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews found"
          description={filtered ? "Try a different filter." : "Customer reviews will show up here."}
        />
      ) : (
        <div className={cn("transition-opacity", isFetching && "opacity-60")}>
          <ul className="flex flex-col gap-3">
            {data.items.map((review) => (
              <li key={review.id}>
                <ReviewCard
                  review={review}
                  onToggleVisible={(visible) => toggleVisible(review, visible)}
                  onReply={() => setReplying(review)}
                  onDelete={() => setDeleting(review)}
                />
              </li>
            ))}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
        </div>
      )}

      <Dialog
        open={replying !== null}
        onClose={() => setReplying(null)}
        variant="sheet"
        title={replying?.reply ? "Edit reply" : "Reply to review"}
        description={replying?.product?.name}
      >
        {replying && <ReplyForm review={replying} onDone={() => setReplying(null)} />}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete review?"
        description={
          <>
            The review by <strong>{deleting?.customerName}</strong> will be permanently deleted and the product rating
            recalculated. Hiding it instead is reversible.
          </>
        }
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
