import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";

export const orderStatusTone: Record<OrderStatus, BadgeTone> = {
  PENDING: "amber",
  CONFIRMED: "blue",
  PROCESSING: "neutral",
  SHIPPED: "dark",
  DELIVERED: "green",
  CANCELLED: "pink",
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={orderStatusTone[status]}>{orderStatusLabel[status]}</Badge>;
}
