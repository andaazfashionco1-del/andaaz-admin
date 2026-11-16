"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { orderStatusLabel } from "@/components/orders/order-status-badge";
import { OrdersTable } from "@/components/orders/orders-table";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/format";
import { useOrders } from "@/lib/queries";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

const statusOptions: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  ...ORDER_STATUSES.map((s) => ({ value: s, label: orderStatusLabel[s] })),
];

export function OrdersView() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading, isFetching, error, refetch } = useOrders({
    status,
    search: debouncedSearch,
    page,
    limit: 20,
  });

  return (
    <>
      <PageHeader title="Orders" description={data ? `${data.total} orders` : undefined} />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          label="Filter by status"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={statusOptions}
        />
        <SearchInput
          label="Search orders"
          placeholder="Order #, name, email, phone…"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data?.items.length ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description={status || search ? "Try a different filter." : "Orders will show up here."}
        />
      ) : (
        <div className={cn("transition-opacity", isFetching && "opacity-60")}>
          <OrdersTable orders={data.items} />
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
        </div>
      )}
    </>
  );
}
