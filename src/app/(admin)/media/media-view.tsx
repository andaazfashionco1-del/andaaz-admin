"use client";

import { Copy, ImageOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MediaPreview } from "@/components/media/media-preview";
import { UploadDropzone } from "@/components/media/upload-dropzone";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { cn, formatBytes, formatDate } from "@/lib/format";
import { useDeleteMedia, useMediaLibrary } from "@/lib/queries";
import type { MediaAsset, MediaType } from "@/lib/types";

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success("URL copied");
  } catch {
    toast.error("Couldn't copy — your browser blocked clipboard access");
  }
}

export function MediaView() {
  const [type, setType] = useState<MediaType | "">("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error, refetch } = useMediaLibrary({ type, page, limit: 40 });
  const remove = useDeleteMedia();
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);

  return (
    <>
      <PageHeader
        title="Media library"
        description="Every image and video uploaded to the store."
      />

      <UploadDropzone accept="ALL" multiple compact />

      <div className="mt-6 mb-4">
        <Tabs
          label="Filter by type"
          value={type}
          onChange={(value) => {
            setType(value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All" },
            { value: "IMAGE", label: "Images" },
            { value: "VIDEO", label: "Videos" },
          ]}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data?.items.length ? (
        <EmptyState icon={ImageOff} title="Nothing here yet" description="Uploaded files will appear here." />
      ) : (
        <div className={cn("transition-opacity", isFetching && "opacity-60")}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.items.map((asset) => (
              <li key={asset.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <MediaPreview
                  url={asset.url}
                  type={asset.type}
                  alt={asset.filename}
                  controls={asset.type === "VIDEO"}
                  className="aspect-square w-full"
                />
                <div className="flex flex-col gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" title={asset.filename}>
                      {asset.filename}
                    </p>
                    <p className="text-xs text-muted">
                      {asset.type === "VIDEO" ? "Video" : "Image"} · {formatBytes(asset.size)} ·{" "}
                      {formatDate(asset.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => void copyUrl(asset.url)}
                      aria-label={`Copy URL of ${asset.filename}`}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden /> Copy URL
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(asset)}
                      aria-label={`Delete ${asset.filename}`}
                    >
                      <Trash2 className="h-4 w-4 text-pink" aria-hidden />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete file?"
        description={
          <>
            <strong>{deleting?.filename}</strong> will be permanently deleted. Products, categories, deals or banners
            still using its URL will show a broken image.
          </>
        }
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
