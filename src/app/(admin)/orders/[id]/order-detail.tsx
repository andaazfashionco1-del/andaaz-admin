"use client";

import { ArrowLeft, Mail, MapPin, Phone, StickyNote } from "lucide-react";
import { useParams } from "next/navigation";
import { MediaPreview } from "@/components/media/media-preview";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { StatusTimeline } from "@/components/orders/status-timeline";
import { StatusUpdate } from "@/components/orders/status-update";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { cn, formatDateTime, formatMoney } from "@/lib/format";
import { useOrder } from "@/lib/queries";

function SummaryRow({ label, value, strong }: { label: React.ReactNode; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", strong ? "text-base font-bold" : "text-sm")}>
      <dt className={strong ? undefined : "text-muted"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error, refetch } = useOrder(id);

  if (isLoading) return <Spinner />;
  if (error || !order) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const address = [
    order.addressLine1,
    order.addressLine2,
    [order.city, order.state, order.postalCode].filter(Boolean).join(", "),
    order.country,
  ].filter(Boolean);

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <ButtonLink href="/orders" variant="secondary" size="icon" aria-label="Back to orders">
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </ButtonLink>
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
            {order.orderNumber} <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader title={`Items (${order.items.reduce((s, i) => s + i.quantity, 0)})`} />
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  {item.image ? (
                    <MediaPreview
                      url={item.image}
                      type="IMAGE"
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-xl"
                    />
                  ) : (
                    <span className="h-16 w-16 shrink-0 rounded-xl bg-paper" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 flex flex-wrap gap-1">
                      {item.size && <Badge>Size {item.size}</Badge>}
                      {item.color && <Badge>{item.color}</Badge>}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {item.quantity} × {formatMoney(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatMoney(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
              <SummaryRow label="Subtotal" value={formatMoney(order.subtotal)} />
              {order.discount > 0 && (
                <SummaryRow
                  label={
                    <span className="flex items-center gap-1.5">
                      Discount
                      {order.couponCode && (
                        <Badge tone="dark" className="font-mono">
                          {order.couponCode}
                        </Badge>
                      )}
                    </span>
                  }
                  value={<span className="text-pink">− {formatMoney(order.discount)}</span>}
                />
              )}
              <SummaryRow label="Shipping" value={order.shippingFee ? formatMoney(order.shippingFee) : "Free"} />
              <SummaryRow label="Total" value={formatMoney(order.total)} strong />
              <SummaryRow label="Payment" value="Cash on delivery" />
            </dl>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader title="Customer" />
              <p className="font-semibold">{order.customerName}</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                <li>
                  <a href={`mailto:${order.email}`} className="flex items-center gap-2 break-all hover:underline">
                    <Mail className="h-4 w-4 shrink-0 text-muted" aria-hidden /> {order.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${order.phone}`} className="flex items-center gap-2 hover:underline">
                    <Phone className="h-4 w-4 shrink-0 text-muted" aria-hidden /> {order.phone}
                  </a>
                </li>
              </ul>
            </Card>
            <Card>
              <CardHeader title="Shipping address" />
              <address className="flex gap-2 text-sm not-italic">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                <span>
                  {address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </address>
            </Card>
          </div>

          {order.notes && (
            <Card>
              <CardHeader title="Customer notes" />
              <p className="flex gap-2 text-sm">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                {order.notes}
              </p>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Update status" />
            <StatusUpdate key={order.status} order={order} />
          </Card>
          <Card>
            <CardHeader title="History" />
            <StatusTimeline history={order.statusHistory} />
          </Card>
        </div>
      </div>
    </>
  );
}
