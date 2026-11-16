"use client";

import { useRouter } from "next/navigation";
import { type Column, DataTable } from "@/components/ui/data-table";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";
import { OrderStatusBadge } from "./order-status-badge";

const columns: Column<Order>[] = [
  {
    key: "order",
    header: "Order",
    hideMobileLabel: true,
    cell: (o) => (
      <div className="min-w-0">
        <p className="font-semibold">{o.orderNumber}</p>
        <p className="truncate text-xs text-muted">
          {o.customerName} · {o.email}
        </p>
      </div>
    ),
  },
  { key: "date", header: "Date", cell: (o) => <span className="text-muted">{formatDateTime(o.createdAt)}</span> },
  {
    key: "items",
    header: "Items",
    cell: (o) => o.items.reduce((sum, i) => sum + i.quantity, 0),
    hideOnMobile: true,
  },
  { key: "total", header: "Total", cell: (o) => <span className="font-semibold">{formatMoney(o.total)}</span> },
  { key: "status", header: "Status", cell: (o) => <OrderStatusBadge status={o.status} /> },
];

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  return (
    <DataTable
      caption="Orders"
      columns={columns}
      rows={orders}
      getRowKey={(o) => o.id}
      onRowClick={(o) => router.push(`/orders/${o.id}`)}
    />
  );
}
