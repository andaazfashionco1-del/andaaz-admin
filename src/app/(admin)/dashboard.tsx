"use client";

import { AlertTriangle, Clock, Package, ShoppingBag, Wallet } from "lucide-react";
import Link from "next/link";
import { LatestReviews } from "@/components/dashboard/latest-reviews";
import { OrdersByStatus } from "@/components/dashboard/orders-by-status";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { MediaPreview } from "@/components/media/media-preview";
import { OrdersTable } from "@/components/orders/orders-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { formatMoney, formatNumber } from "@/lib/format";
import { useStats } from "@/lib/queries";

export function Dashboard() {
  const { data: stats, isLoading, error, refetch } = useStats();

  if (isLoading) return <Spinner />;
  if (error || !stats) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const fourteenDayTotal = stats.salesByDay.reduce((sum, d) => sum + d.total, 0);

  return (
    <>
      <PageHeader title="Dashboard" description="A snapshot of how Andaaz is doing." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatMoney(stats.totalRevenue)} icon={Wallet} highlight hint="Excludes cancelled" />
        <StatCard label="Orders" value={formatNumber(stats.totalOrders)} icon={ShoppingBag} />
        <StatCard
          label="Products"
          value={formatNumber(stats.totalProducts)}
          icon={Package}
          hint={`${stats.totalCategories} categories`}
        />
        <StatCard label="Pending orders" value={formatNumber(stats.pendingOrders)} icon={Clock} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Sales · last 14 days"
            action={<span className="text-sm font-semibold">{formatMoney(fourteenDayTotal)}</span>}
          />
          <SalesChart data={stats.salesByDay} />
        </Card>
        <Card>
          <CardHeader title="Orders by status" />
          <OrdersByStatus data={stats.ordersByStatus} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent orders</h2>
            <Link href="/orders" className="text-sm font-semibold underline underline-offset-2">
              View all
            </Link>
          </div>
          {stats.recentOrders.length ? (
            <OrdersTable orders={stats.recentOrders} />
          ) : (
            <Card>
              <p className="text-sm text-muted">No orders yet.</p>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Top products" />
            {stats.topProducts.length ? (
              <ol className="flex flex-col gap-3">
                {stats.topProducts.map((p, index) => (
                  <li key={p.id}>
                    <Link href={`/products/${p.id}`} className="flex items-center gap-3 rounded-xl hover:bg-paper/60">
                      <span className="w-4 text-xs font-bold text-muted">{index + 1}</span>
                      {p.image ? (
                        <MediaPreview url={p.image} type="IMAGE" className="h-10 w-10 rounded-lg" />
                      ) : (
                        <span className="h-10 w-10 rounded-lg bg-paper" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        <span className="text-xs text-muted">{formatNumber(p.soldCount)} sold</span>
                      </span>
                      <span className="text-sm font-semibold">{formatMoney(p.revenue)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">No sales yet.</p>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Low stock"
              action={
                stats.lowStockProducts.length > 0 && (
                  <Badge tone="pink">
                    <AlertTriangle className="h-3 w-3" aria-hidden /> {stats.lowStockProducts.length}
                  </Badge>
                )
              }
            />
            {stats.lowStockProducts.length ? (
              <ul className="flex flex-col gap-2">
                {stats.lowStockProducts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 hover:bg-paper/60"
                    >
                      <span className="truncate text-sm font-medium">{p.name}</span>
                      <Badge tone={p.stock === 0 ? "pink" : "amber"}>
                        {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">All products are well stocked.</p>
            )}
          </Card>

          <LatestReviews />
        </div>
      </div>
    </>
  );
}
