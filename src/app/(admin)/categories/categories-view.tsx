"use client";

import { CornerDownRight, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { CategoryForm } from "@/components/categories/category-form";
import { MediaPreview } from "@/components/media/media-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { useCategories, useDeleteCategory } from "@/lib/queries";
import type { Category } from "@/lib/types";

type Row = Category & { depth: number; parentName: string | null };

/** Flattens categories into parent-first order with depth, for a tree-like table. */
function toTreeRows(categories: Category[]): Row[] {
  const byParent = new Map<string | null, Category[]>();
  const ids = new Set(categories.map((c) => c.id));
  for (const c of categories) {
    const key = c.parentId && ids.has(c.parentId) ? c.parentId : null;
    byParent.set(key, [...(byParent.get(key) ?? []), c]);
  }
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const rows: Row[] = [];
  const walk = (parentId: string | null, depth: number) => {
    const children = (byParent.get(parentId) ?? []).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    );
    for (const c of children) {
      rows.push({ ...c, depth, parentName: c.parentId ? (names.get(c.parentId) ?? null) : null });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return rows;
}

export function CategoriesView() {
  const { data, isLoading, error, refetch } = useCategories();
  const remove = useDeleteCategory();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const categories = data ?? [];
  const rows = toTreeRows(categories);

  const actions = (c: Category) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
        <Trash2 className="h-4 w-4 text-pink" aria-hidden />
      </Button>
    </div>
  );

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Category",
      hideMobileLabel: true,
      cell: (c) => (
        <div className="flex items-center gap-3" style={{ paddingLeft: `${c.depth * 1.25}rem` }}>
          {c.depth > 0 && <CornerDownRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />}
          {c.image ? (
            <MediaPreview url={c.image} type="IMAGE" className="h-10 w-10 shrink-0 rounded-lg" />
          ) : (
            <span className="h-10 w-10 shrink-0 rounded-lg bg-paper" />
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold">{c.name}</p>
            <p className="truncate text-xs text-muted">/{c.slug}</p>
          </div>
        </div>
      ),
    },
    { key: "parent", header: "Parent", cell: (c) => c.parentName ?? <span className="text-muted">—</span> },
    { key: "products", header: "Products", cell: (c) => c.productCount },
    {
      key: "status",
      header: "Status",
      cell: (c) => (
        <div className="flex flex-wrap justify-end gap-1 md:justify-start">
          <Badge tone={c.isActive ? "green" : "neutral"}>{c.isActive ? "Active" : "Inactive"}</Badge>
          {c.isFeatured && <Badge tone="lime">Featured</Badge>}
        </div>
      ),
    },
    { key: "sort", header: "Order", cell: (c) => c.sortOrder, hideOnMobile: true },
    { key: "actions", header: "", cell: actions, hideOnMobile: true, className: "w-24" },
  ];

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organise products into categories and sub-categories."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden /> New category
          </Button>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Create your first category to start adding products."
        />
      ) : (
        <DataTable caption="Categories" columns={columns} rows={rows} getRowKey={(c) => c.id} mobileActions={actions} />
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        variant="sheet"
        title={editing === "new" ? "New category" : "Edit category"}
      >
        {editing !== null && (
          <CategoryForm
            category={editing === "new" ? null : editing}
            categories={categories}
            onDone={() => setEditing(null)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete category?"
        description={
          <>
            <strong>{deleting?.name}</strong> will be permanently deleted. Categories that still have products or
            sub-categories can&apos;t be deleted.
          </>
        }
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
