"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { MediaInput } from "@/lib/types";
import { MediaPicker } from "./media-picker";
import { MediaPreview } from "./media-preview";
import type { MediaAccept } from "./upload-dropzone";

/** Single media value with preview + choose/replace/remove. */
export function MediaField({
  value,
  onChange,
  accept = "IMAGE",
  label,
}: {
  value: MediaInput | null;
  onChange: (value: MediaInput | null) => void;
  accept?: MediaAccept;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-white sm:w-48">
        {value ? (
          <MediaPreview url={value.url} type={value.type} controls={value.type === "VIDEO"} className="h-full w-full" />
        ) : (
          <ImagePlus className="h-6 w-6 text-muted" aria-hidden />
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)} aria-label={`Choose ${label}`}>
          <ImagePlus className="h-4 w-4" aria-hidden />
          {value ? "Replace" : "Choose"}
        </Button>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)} aria-label={`Remove ${label}`}>
            <Trash2 className="h-4 w-4" aria-hidden /> Remove
          </Button>
        )}
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        accept={accept}
        title={`Choose ${label.toLowerCase()}`}
        onSelect={([media]) => onChange(media ?? null)}
      />
    </div>
  );
}
