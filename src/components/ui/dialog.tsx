"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/format";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** `modal` is centered; `sheet` slides in from the right (full screen on mobile). */
  variant?: "modal" | "sheet";
  size?: "sm" | "md" | "lg" | "xl";
};

const modalSizes = { sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-2xl", xl: "sm:max-w-4xl" };

/**
 * Accessible dialog built on the native `<dialog>` element (focus trap, Esc, top layer).
 * Content is only mounted while open so forms reset between openings.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "modal",
  size = "md",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const isSheet = variant === "sheet";

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-0 max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]",
        isSheet
          ? "ml-auto h-dvh w-full sm:max-w-xl"
          : cn("h-dvh w-full sm:m-auto sm:h-auto sm:max-h-[90dvh]", modalSizes[size]),
      )}
    >
      {open && (
        <div
          className={cn(
            "flex h-full flex-col bg-paper shadow-2xl",
            isSheet ? "" : "sm:max-h-[90dvh] sm:rounded-3xl",
          )}
        >
          <header className="flex items-start justify-between gap-4 border-b border-line bg-white px-5 py-4 sm:rounded-t-3xl">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && <div className="mt-0.5 text-sm text-muted">{description}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1 rounded-full p-1.5 text-muted hover:bg-ink/5 hover:text-ink"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer && (
            <footer className="flex flex-wrap justify-end gap-2 border-t border-line bg-white px-5 py-3 sm:rounded-b-3xl">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  );
}
