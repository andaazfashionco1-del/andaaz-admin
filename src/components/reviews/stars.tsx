import { Star } from "lucide-react";
import { cn } from "@/lib/format";

/** Read-only 5-star display; supports fractional averages (rounded to the nearest half). */
export function Stars({ value, className }: { value: number; className?: string }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
        return (
          <span key={i} className="relative inline-block h-3.5 w-3.5" aria-hidden>
            <Star className="absolute inset-0 h-3.5 w-3.5 text-line" fill="currentColor" strokeWidth={0} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="h-3.5 w-3.5 text-amber-400" fill="currentColor" strokeWidth={0} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

/** Compact "★ 4.3 (12)" summary for a product rating. */
export function RatingSummary({ rating }: { rating: { average: number; count: number } }) {
  if (!rating.count) return <span className="text-xs text-muted">No reviews</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Stars value={rating.average} />
      <span className="font-semibold tabular-nums">{rating.average.toFixed(1)}</span>
      <span className="text-xs text-muted">({rating.count})</span>
    </span>
  );
}
