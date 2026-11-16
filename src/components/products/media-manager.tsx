"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Library, X } from "lucide-react";
import { useState } from "react";
import { MediaPicker } from "@/components/media/media-picker";
import { MediaPreview } from "@/components/media/media-preview";
import { UploadDropzone } from "@/components/media/upload-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/format";
import type { MediaInput } from "@/lib/types";

function SortableTile({
  media,
  index,
  onRemove,
}: {
  media: MediaInput;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: media.url,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border border-line bg-white",
        isDragging && "z-10 shadow-xl ring-2 ring-ink",
      )}
    >
      <MediaPreview url={media.url} type={media.type} controls={media.type === "VIDEO"} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-1.5">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="pointer-events-auto cursor-grab touch-none rounded-full bg-white/90 p-1.5 text-ink shadow active:cursor-grabbing"
          aria-label={`Reorder media ${index + 1}`}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="pointer-events-auto rounded-full bg-white/90 p-1.5 text-pink shadow hover:bg-white"
          aria-label={`Remove media ${index + 1}`}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {index === 0 && (
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold tracking-wide text-ink uppercase">
          Cover
        </span>
      )}
    </li>
  );
}

/** Upload / pick / reorder (drag) / remove product media. First item is the cover. */
export function MediaManager({ value, onChange }: { value: MediaInput[]; onChange: (value: MediaInput[]) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const append = (items: MediaInput[]) => {
    const existing = new Set(value.map((m) => m.url));
    onChange([...value, ...items.filter((m) => !existing.has(m.url))]);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = value.findIndex((m) => m.url === active.id);
    const to = value.findIndex((m) => m.url === over.id);
    onChange(arrayMove(value, from, to));
  };

  return (
    <div className="flex flex-col gap-3">
      <UploadDropzone accept="ALL" multiple compact onUploaded={(assets) => append(assets.map(({ url, type }) => ({ url, type })))} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {value.length ? "Drag to reorder — the first item is the cover." : "No media yet."}
        </p>
        <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
          <Library className="h-4 w-4" aria-hidden /> From library
        </Button>
      </div>
      {value.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={value.map((m) => m.url)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {value.map((media, index) => (
                <SortableTile
                  key={media.url}
                  media={media}
                  index={index}
                  onRemove={() => onChange(value.filter((m) => m.url !== media.url))}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} multiple onSelect={append} />
    </div>
  );
}
