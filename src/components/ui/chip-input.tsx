"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/format";
import { controlClasses } from "./field";

type ChipInputProps = {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** Quick-add suggestions shown under the input. */
  presets?: { label: string; values: string[] }[];
  transform?: (raw: string) => string;
};

export function ChipInput({ id, value, onChange, placeholder, presets, transform }: ChipInputProps) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const items = raw
      .split(",")
      .map((s) => (transform ? transform(s.trim()) : s.trim()))
      .filter(Boolean);
    const next = [...value];
    for (const item of items) if (!next.includes(item)) next.push(item);
    onChange(next);
    setDraft("");
  };

  const remove = (item: string) => onChange(value.filter((v) => v !== item));

  const toggle = (item: string) => (value.includes(item) ? remove(item) : onChange([...value, item]));

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          controlClasses,
          "flex min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5 focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/10",
        )}
      >
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-ink py-0.5 pr-1 pl-2.5 text-xs font-semibold text-white"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(item)}
              className="rounded-full p-0.5 hover:bg-white/20"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={value.length ? "" : placeholder}
          className="h-7 min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
        />
      </div>
      {presets?.map((group) => (
        <div key={group.label} className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-muted">{group.label}</span>
          {group.values.map((preset) => {
            const active = value.includes(preset);
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(preset)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition",
                  active ? "bg-lime text-ink ring-lime" : "bg-white text-ink/70 ring-line hover:ring-ink/30",
                )}
              >
                {preset}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
