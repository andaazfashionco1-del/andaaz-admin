"use client";

import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { MediaPreview } from "@/components/media/media-preview";
import { RatingSummary } from "@/components/reviews/stars";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn, formatMoney } from "@/lib/format";
import { type ProductFilters, useCategories, useDeleteProduct, useProducts, useSaveProduct } from "@/lib/queries";
import type { Product } from "@/lib/types";

const LOW_STOCK = 5;

export function ProductsView() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<ProductFilters["status"]>("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching, error, refetch } = useProducts({
    search: debouncedSearch,
    category,
    status,
    page,
    limit: 20,
  });
  const { data: categories } = useCategories();
  const save = useSaveProduct();
  const remove = useDeleteProduct();
  const [deleting, setDeleting] = useState<Product | null>(null);

  const toggle = (product: Product, field: "isActive" | "isFeatured", value: boolean) =>
    save.mutate(
      { id: product.id, data: { [field]: value } },
      { onSuccess: () => toast.success(`${product.name} updated`) },
    );

  const actions = (p: Product) => (
    <div className="flex justify-end gap-1">
      <ButtonLink href={`/products/${p.id}`} variant="ghost" size="icon" aria-label={`Edit ${p.name}`}>
        <Pencil className="h-4 w-4" aria-hidden />
      </ButtonLink>
      <Button variant="ghost" size="icon" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`}>
        <Trash2 className="h-4 w-4 text-pink" aria-hidden />
      </Button>
    </div>
  );

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Product",
      hideMobileLabel: true,
      cell: (p) => {
        const cover = p.media.find((m) => m.type === "IMAGE") ?? p.media[0];
        return (
          <Link href={`/products/${p.id}`} className="flex items-center gap-3">
            {cover ? (
              <MediaPreview url={cover.url} type={cover.type} className="h-12 w-12 shrink-0 rounded-lg" />
            ) : (
              <span className="h-12 w-12 shrink-0 rounded-lg bg-paper" />
            )}
            <span className="min-w-0">
              <span className="block truncate font-semibold hover:underline">{p.name}</span>
              <span className="mt-0.5 flex flex-wrap gap-1">
                {p.isNew && <Badge tone="lime">New</Badge>}
                {p.activeDeal && <Badge tone="pink">{p.activeDeal.title}</Badge>}
              </span>
            </span>
          </Link>
        );
      },
    },
    { key: "category", header: "Category", cell: (p) => p.category?.name ?? "—" },
    {
      key: "price",
      header: "Price",
      cell: (p) =>
        p.finalPrice < p.price ? (
          <span className="flex flex-col items-end md:items-start">
            <span className="font-semibold text-pink">{formatMoney(p.finalPrice)}</span>
            <span className="text-xs text-muted line-through">{formatMoney(p.price)}</span>
          </span>
        ) : (
          <span className="font-semibold">{formatMoney(p.price)}</span>
        ),
    },
    { key: "rating", header: "Rating", cell: (p) => <RatingSummary rating={p.rating} /> },
    {
      key: "stock",
      header: "Stock",
      cell: (p) => (
        <span className={cn("font-semibold tabular-nums", p.stock <= LOW_STOCK && "text-pink")}>
          {p.stock}
          {p.stock <= LOW_STOCK && <span className="ml-1 text-xs font-medium">{p.stock === 0 ? "out" : "low"}</span>}
        </span>
      ),
    },
    {
      key: "active",
      header: "Active",
      cell: (p) => (
        <Switch label={`Active: ${p.name}`} hideLabel checked={p.isActive} onChange={(v) => toggle(p, "isActive", v)} />
      ),
    },
    {
      key: "featured",
      header: "Featured",
      cell: (p) => (
        <Switch
          label={`Featured: ${p.name}`}
          hideLabel
          checked={p.isFeatured}
          onChange={(v) => toggle(p, "isFeatured", v)}
        />
      ),
    },
    { key: "actions", header: "", cell: actions, hideOnMobile: true, className: "w-24" },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description={data ? `${data.total} products` : undefined}
        actions={
          <ButtonLink href="/products/new">
            <Plus className="h-4 w-4" aria-hidden /> New product
          </ButtonLink>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          label="Search products"
          placeholder="Search products…"
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="sm:w-48"
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ProductFilters["status"]);
              setPage(1);
            }}
            className="sm:w-40"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lowstock">Low stock</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data?.items.length ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={search || category || status ? "Try adjusting the filters." : "Add your first product."}
        />
      ) : (
        <div className={cn("transition-opacity", isFetching && "opacity-60")}>
          <DataTable caption="Products" columns={columns} rows={data.items} getRowKey={(p) => p.id} mobileActions={actions} />
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete product?"
        description={
          <>
            <strong>{deleting?.name}</strong> will be permanently removed from the store.
          </>
        }
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
