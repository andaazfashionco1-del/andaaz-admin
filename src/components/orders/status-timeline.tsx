import { cn, formatDateTime } from "@/lib/format";
import type { Order } from "@/lib/types";
import { orderStatusLabel } from "./order-status-badge";

export function StatusTimeline({ history }: { history: Order["statusHistory"] }) {
  const entries = [...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <ol className="relative flex flex-col gap-5 pl-6">
      <span className="absolute top-1.5 bottom-1.5 left-[7px] w-px bg-line" aria-hidden />
      {entries.map((entry, i) => (
        <li key={`${entry.status}-${entry.createdAt}`} className="relative">
          <span
            className={cn(
              "absolute top-1 -left-6 h-3.5 w-3.5 rounded-full border-2 border-white ring-1",
              i === 0 ? (entry.status === "CANCELLED" ? "bg-pink ring-pink" : "bg-lime ring-ink") : "bg-line ring-line",
            )}
            aria-hidden
          />
          <p className="text-sm font-semibold">{orderStatusLabel[entry.status]}</p>
          <p className="text-xs text-muted">{formatDateTime(entry.createdAt)}</p>
          {entry.note && <p className="mt-1 rounded-lg bg-paper px-2.5 py-1.5 text-sm">{entry.note}</p>}
        </li>
      ))}
    </ol>
  );
}
