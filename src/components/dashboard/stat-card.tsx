import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";

export function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  highlight?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4 sm:p-5",
        highlight ? "border-ink bg-ink text-white" : "border-line bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-sm font-semibold", highlight ? "text-white/70" : "text-muted")}>{label}</p>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            highlight ? "bg-lime text-ink" : "bg-paper text-ink",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
      {hint && <p className={cn("text-xs", highlight ? "text-white/60" : "text-muted")}>{hint}</p>}
    </div>
  );
}
