"use client";

import { Film, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { BannerForm } from "@/components/banners/banner-form";
import { MediaPreview } from "@/components/media/media-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useBanners, useDeleteBanner, useSaveBanner } from "@/lib/queries";
import type { Banner } from "@/lib/types";

export function BannersView() {
  const { data, isLoading, error, refetch } = useBanners();
  const save = useSaveBanner();
  const remove = useDeleteBanner();
  const [editing, setEditing] = useState<Banner | "new" | null>(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);

  const banners = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <PageHeader
        title="Banners"
        description="Hero slides on the storefront home page."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden /> New banner
          </Button>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !banners.length ? (
        <EmptyState icon={Film} title="No banners yet" description="Add an image or video hero banner." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {banners.map((b) => (
            <li key={b.id} className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative aspect-[16/9] bg-ink">
                <MediaPreview url={b.mediaUrl} type={b.mediaType} alt={b.title} className="h-full w-full" />
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/80 via-ink/10 to-transparent p-4 text-white">
                  <p className="font-display text-lg leading-tight font-semibold">{b.title}</p>
                  {b.subtitle && <p className="mt-0.5 line-clamp-1 text-sm text-white/75">{b.subtitle}</p>}
                  {b.ctaText && (
                    <span className="mt-2 w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-ink">
                      {b.ctaText}
                    </span>
                  )}
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge tone="dark">#{b.sortOrder}</Badge>
                  {b.mediaType === "VIDEO" && <Badge tone="lime">Video</Badge>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Switch
                    label={`Active: ${b.title}`}
                    hideLabel
                    checked={b.isActive}
                    onChange={(isActive) => save.mutate({ id: b.id, data: { isActive } })}
                  />
                  <span className="truncate text-xs text-muted">{b.ctaLink ?? (b.isActive ? "Active" : "Hidden")}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(b)} aria-label={`Edit ${b.title}`}>
                    <Pencil className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleting(b)} aria-label={`Delete ${b.title}`}>
                    <Trash2 className="h-4 w-4 text-pink" aria-hidden />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        variant="sheet"
        title={editing === "new" ? "New banner" : "Edit banner"}
      >
        {editing !== null && (
          <BannerForm banner={editing === "new" ? null : editing} onDone={() => setEditing(null)} />
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete banner?"
        description={
          <>
            <strong>{deleting?.title}</strong> will be removed from the home page.
          </>
        }
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
