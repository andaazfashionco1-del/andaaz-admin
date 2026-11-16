"use client";

import { BadgeCheck, MessageSquareReply, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MediaPreview } from "@/components/media/media-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn, formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";
import { Stars } from "./stars";

const CLAMP_AT = 180;

export function ReviewCard({
  review,
  onToggleVisible,
  onReply,
  onDelete,
}: {
  review: Review;
  onToggleVisible: (visible: boolean) => void;
  onReply: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const long = review.comment.length > CLAMP_AT;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row sm:gap-4",
        review.isApproved ? "border-line" : "border-dashed border-ink/20 bg-white/60",
      )}
    >
      {review.product && (
        <Link
          href={`/products/${review.product.id}`}
          className="flex shrink-0 items-center gap-3 sm:w-48 sm:flex-col sm:items-start"
        >
          {review.product.image ? (
            <MediaPreview url={review.product.image} type="IMAGE" className="h-12 w-12 rounded-lg sm:h-16 sm:w-16" />
          ) : (
            <span className="h-12 w-12 rounded-lg bg-paper sm:h-16 sm:w-16" />
          )}
          <span className="line-clamp-2 text-sm font-semibold hover:underline">{review.product.name}</span>
        </Link>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Stars value={review.rating} />
          <span className="text-sm font-semibold">{review.customerName}</span>
          {review.isVerifiedPurchase && (
            <Badge tone="green">
              <BadgeCheck className="h-3 w-3" aria-hidden /> Verified purchase
            </Badge>
          )}
          {!review.isApproved && <Badge tone="pink">Hidden</Badge>}
          <span className="text-xs text-muted">{formatDate(review.createdAt)}</span>
        </div>
        {review.title && <p className="mt-2 font-semibold">{review.title}</p>}
        <p className={cn("mt-1 text-sm whitespace-pre-line text-ink/80", !expanded && "line-clamp-3")}>
          {review.comment}
        </p>
        {long && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-1 text-xs font-semibold underline underline-offset-2"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
        {review.reply && (
          <div className="mt-3 rounded-xl border-l-2 border-lime bg-paper px-3 py-2">
            <p className="text-xs font-semibold text-muted">Store reply · {formatDate(review.reply.createdAt)}</p>
            <p className="mt-0.5 text-sm whitespace-pre-line">{review.reply.text}</p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-0 sm:pt-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <span aria-hidden>Visible</span>
          <Switch
            label={`Visible: review by ${review.customerName}`}
            hideLabel
            checked={review.isApproved}
            onChange={onToggleVisible}
          />
        </div>
        <div className="flex gap-1">
          <Button variant="secondary" size="sm" onClick={onReply}>
            <MessageSquareReply className="h-3.5 w-3.5" aria-hidden />
            {review.reply ? "Edit reply" : "Reply"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label={`Delete review by ${review.customerName}`}
          >
            <Trash2 className="h-4 w-4 text-pink" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}
