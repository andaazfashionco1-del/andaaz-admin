"use client";

import Link from "next/link";
import { Stars } from "@/components/reviews/stars";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { useReviews } from "@/lib/queries";

export function LatestReviews() {
  const { data } = useReviews({ page: 1, limit: 4 });
  if (!data) return null;

  return (
    <Card>
      <CardHeader
        title="Latest reviews"
        action={
          <Link href="/reviews" className="text-sm font-semibold underline underline-offset-2">
            Moderate
          </Link>
        }
      />
      {data.items.length ? (
        <ul className="flex flex-col divide-y divide-line">
          {data.items.map((r) => (
            <li key={r.id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <Stars value={r.rating} />
                {!r.isApproved && <Badge tone="pink">Hidden</Badge>}
              </div>
              <p className="mt-1 line-clamp-2 text-sm">{r.title ?? r.comment}</p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {r.customerName}
                {r.product && ` · ${r.product.name}`}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No reviews yet.</p>
      )}
    </Card>
  );
}
