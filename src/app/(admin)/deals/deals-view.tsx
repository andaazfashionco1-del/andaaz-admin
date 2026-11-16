"use client";

import { Home, Pencil, Plus, TicketPercent, Trash2 } from "lucide-react";
import { useState } from "react";
import { DealForm } from "@/components/deals/deal-form";
import { DealStatusBadge } from "@/components/deals/deal-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime, formatDealValue, formatMoney } from "@/lib/format";
import { useDeals, useDeleteDeal } from "@/lib/queries";
import type { Deal } from "@/lib/types";

function scopeLabel(deal: Deal) {
  if (deal.scope === "CATEGORY") return deal.category?.name ?? "Category";
  if (deal.scope === "PRODUCTS") return `${deal.productIds.length} product${deal.productIds.length === 1 ? "" : "s"}`;
  return "All products";
}

export function DealsView() {
  const { data, isLoading, error, refetch } = useDeals();
  const remove = useDeleteDeal();
  const [editing, setEditing] = useState<Deal | "new" | null>(null);
  const [deleting, setDeleting] = useState<Deal | null>(null);

  const actions = (d: Deal) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => setEditing(d)} aria-label={`Edit ${d.title}`}>
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setDeleting(d)} aria-label={`Delete ${d.title}`}>
        <Trash2 className="h-4 w-4 text-pink" aria-hidden />
      </Button>
    </div>
  );

  const columns: Column<Deal>[] = [
    {
      key: "deal",
      header: "Deal",
      hideMobileLabel: true,
      cell: (d) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-semibold">
            {d.title}
            {d.showOnHome && <Home className="h-3.5 w-3.5 text-muted" aria-label="Shown on home" />}
          </p>
          <p className="text-xs text-muted">{formatDealValue(d)}</p>
        </div>
      ),
    },
    {
      key: "code",
      header: "Type",
      cell: (d) =>
        d.code ? (
          <span className="flex flex-col items-end gap-0.5 md:items-start">
            <Badge tone="dark" className="font-mono tracking-wider">
              {d.code}
            </Badge>
            {d.minOrderAmount ? <span className="text-xs text-muted">Min {formatMoney(d.minOrderAmount)}</span> : null}
          </span>
        ) : (
          <Badge tone="lime">Automatic</Badge>
        ),
    },
    { key: "scope", header: "Applies to", cell: scopeLabel },
    {
      key: "dates",
      header: "Schedule",
      cell: (d) => (
        <span className="text-xs text-muted">
          {formatDateTime(d.startsAt)} → <br className="hidden md:block" />
          {formatDateTime(d.endsAt)}
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (d) => <DealStatusBadge deal={d} /> },
    { key: "actions", header: "", cell: actions, hideOnMobile: true, className: "w-24" },
  ];

  return (
    <>
      <PageHeader
        title="Deals"
        description="Automatic discounts and checkout coupons."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden /> New deal
          </Button>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data?.length ? (
        <EmptyState icon={TicketPercent} title="No deals yet" description="Create a sale or a coupon code." />
      ) : (
        <DataTable caption="Deals" columns={columns} rows={data} getRowKey={(d) => d.id} mobileActions={actions} />
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        variant="sheet"
        title={editing === "new" ? "New deal" : "Edit deal"}
      >
        {editing !== null && <DealForm deal={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete deal?"
        description={
          <>
            <strong>{deleting?.title}</strong> will be removed and its discount will stop applying immediately.
          </>
        }
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
