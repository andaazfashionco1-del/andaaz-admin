"use client";

import { Check, ImageOff } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/format";
import { MediaPreview } from "./media-preview";
import { useMediaLibrary } from "@/lib/queries";
import type { MediaAsset, MediaType } from "@/lib/types";

/** Paginated selectable grid of media library assets. */
export function MediaLibraryGrid({
  type,
  page,
  onPageChange,
  selected,
  onToggle,
}: {
  type: MediaType | "";
  page: number;
  onPageChange: (page: number) => void;
  selected: MediaAsset[];
  onToggle: (asset: MediaAsset) => void;
}) {
  const { data, isLoading, error, refetch } = useMediaLibrary({ type, page, limit: 24 });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!data?.items.length)
    return <EmptyState icon={ImageOff} title="No files yet" description="Upload files to build your library." />;

  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {data.items.map((asset) => {
          const isSelected = selected.some((s) => s.id === asset.id);
          return (
            <li key={asset.id}>
              <button
                type="button"
                onClick={() => onToggle(asset)}
                aria-pressed={isSelected}
                aria-label={`${isSelected ? "Deselect" : "Select"} ${asset.filename}`}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-xl ring-2 transition",
                  isSelected ? "ring-ink" : "ring-transparent hover:ring-ink/30",
                )}
              >
                <MediaPreview url={asset.url} type={asset.type} className="h-full w-full" />
                {isSelected && (
                  <span className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-lime text-ink">
                    <Check className="h-4 w-4" aria-hidden />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onChange={onPageChange} />
    </>
  );
}
