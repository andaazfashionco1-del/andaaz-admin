"use client";

import { useQueryClient } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/api";
import { cn, errorMessage } from "@/lib/format";
import { queryKeys } from "@/lib/queries";
import type { MediaAsset } from "@/lib/types";

export type MediaAccept = "IMAGE" | "VIDEO" | "ALL";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MB = 1024 * 1024;

function allowedTypes(accept: MediaAccept) {
  if (accept === "IMAGE") return IMAGE_TYPES;
  if (accept === "VIDEO") return VIDEO_TYPES;
  return [...IMAGE_TYPES, ...VIDEO_TYPES];
}

function validate(file: File, accept: MediaAccept): string | null {
  if (!allowedTypes(accept).includes(file.type)) return `${file.name}: unsupported file type`;
  const isVideo = VIDEO_TYPES.includes(file.type);
  if (isVideo && file.size > 100 * MB) return `${file.name}: videos must be 100MB or less`;
  if (!isVideo && file.size > 10 * MB) return `${file.name}: images must be 10MB or less`;
  return null;
}

const hints: Record<MediaAccept, string> = {
  IMAGE: "JPG, PNG, WEBP, GIF, AVIF up to 10MB",
  VIDEO: "MP4, WEBM, MOV up to 100MB",
  ALL: "Images up to 10MB · MP4, WEBM, MOV videos up to 100MB",
};

type UploadDropzoneProps = {
  accept?: MediaAccept;
  multiple?: boolean;
  onUploaded?: (assets: MediaAsset[]) => void;
  compact?: boolean;
};

export function UploadDropzone({ accept = "ALL", multiple = true, onUploaded, compact }: UploadDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const handleFiles = async (list: FileList | null) => {
    if (!list?.length || progress !== null) return;
    const files = multiple ? Array.from(list) : [list[0]];
    const errors = files.map((f) => validate(f, accept)).filter((e): e is string => Boolean(e));
    if (errors.length) {
      errors.forEach((e) => toast.error(e));
      return;
    }
    setProgress(0);
    try {
      const assets = await uploadFiles(files, setProgress);
      toast.success(`Uploaded ${assets.length} file${assets.length === 1 ? "" : "s"}`);
      await queryClient.invalidateQueries({ queryKey: queryKeys.media });
      onUploaded?.(assets);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const uploading = progress !== null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 text-center transition",
        compact ? "py-6" : "py-10",
        dragging ? "border-ink bg-lime/20" : "border-line bg-white hover:border-ink/30",
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        multiple={multiple}
        accept={allowedTypes(accept).join(",")}
        onChange={(e) => void handleFiles(e.target.files)}
        disabled={uploading}
      />
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-lime">
        <UploadCloud className="h-5 w-5" aria-hidden />
      </span>
      {uploading ? (
        <div className="w-full max-w-xs" role="status" aria-live="polite">
          {progress < 100 ? (
            <p className="text-sm font-semibold">Uploading… {progress}%</p>
          ) : (
            <p className="text-sm font-semibold">Processing on server…</p>
          )}
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper">
            <div
              className={cn("h-full rounded-full bg-ink transition-[width]", progress >= 100 && "animate-pulse")}
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress >= 100 && (
            <p className="mt-1.5 text-xs text-muted">Large videos can take a moment to finish storing.</p>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm">
            <span className="font-semibold">Drag & drop {multiple ? "files" : "a file"}</span> or{" "}
            <label htmlFor={inputId} className="cursor-pointer font-semibold underline underline-offset-2">
              browse
            </label>
          </p>
          <p className="text-xs text-muted">{hints[accept]}</p>
        </>
      )}
    </div>
  );
}
