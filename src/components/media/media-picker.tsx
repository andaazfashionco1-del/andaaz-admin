"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import type { MediaAsset, MediaInput, MediaType } from "@/lib/types";
import { MediaLibraryGrid } from "./media-library-grid";
import { type MediaAccept, UploadDropzone } from "./upload-dropzone";

type MediaPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaInput[]) => void;
  accept?: MediaAccept;
  multiple?: boolean;
  title?: string;
};

/** Modal with Upload + Library tabs. Selected/uploaded media are returned via `onSelect`. */
export function MediaPicker({ open, onClose, ...props }: MediaPickerProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={props.title ?? (props.multiple ? "Add media" : "Choose media")}
      size="xl"
    >
      <MediaPickerBody onClose={onClose} {...props} />
    </Dialog>
  );
}

function MediaPickerBody({
  onClose,
  onSelect,
  accept = "ALL",
  multiple = false,
}: Omit<MediaPickerProps, "open" | "title">) {
  const [tab, setTab] = useState<"upload" | "library">("upload");
  const [typeFilter, setTypeFilter] = useState<MediaType | "">(accept === "ALL" ? "" : accept);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MediaAsset[]>([]);

  const finish = (assets: MediaAsset[]) => {
    if (!assets.length) return;
    onSelect(assets.map(({ url, type }) => ({ url, type })));
    onClose();
  };

  const toggle = (asset: MediaAsset) => {
    if (!multiple) {
      setSelected([asset]);
      return;
    }
    setSelected((prev) =>
      prev.some((a) => a.id === asset.id) ? prev.filter((a) => a.id !== asset.id) : [...prev, asset],
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        label="Media source"
        value={tab}
        onChange={setTab}
        options={[
          { value: "upload", label: "Upload" },
          { value: "library", label: "Media library" },
        ]}
      />

      {tab === "upload" ? (
        <UploadDropzone accept={accept} multiple={multiple} onUploaded={finish} />
      ) : (
        <>
          {accept === "ALL" && (
            <Tabs
              label="Filter by type"
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All" },
                { value: "IMAGE", label: "Images" },
                { value: "VIDEO", label: "Videos" },
              ]}
            />
          )}
          <MediaLibraryGrid
            type={typeFilter}
            page={page}
            onPageChange={setPage}
            selected={selected}
            onToggle={toggle}
          />
          <div className="sticky bottom-0 -mx-5 -mb-5 flex items-center justify-between gap-3 border-t border-line bg-white px-5 py-3">
            <p className="text-sm text-muted">{selected.length} selected</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => finish(selected)} disabled={!selected.length}>
                {multiple ? `Add ${selected.length || ""}`.trim() : "Use selected"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
