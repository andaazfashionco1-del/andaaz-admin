import { orderStatusLabel } from "@/components/orders/order-status-badge";
import { formatNumber } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

export function OrdersByStatus({ data }: { data: Record<OrderStatus, number> }) {
  const max = Math.max(1, ...ORDER_STATUSES.map((s) => data[s] ?? 0));
  return (
    <ul className="flex flex-col gap-3">
      {ORDER_STATUSES.map((status) => {
        const count = data[status] ?? 0;
        return (
          <li key={status} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
            <span className="text-muted">{orderStatusLabel[status]}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-paper" aria-hidden>
              <span
                className={`block h-full rounded-full ${status === "CANCELLED" ? "bg-pink" : "bg-ink"}`}
                style={{ width: `${(count / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-semibold tabular-nums">{formatNumber(count)}</span>
          </li>
        );
      })}
    </ul>
  );
}
