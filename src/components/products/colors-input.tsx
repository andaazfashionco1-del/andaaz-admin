"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductColor } from "@/lib/types";

export function ColorsInput({
  value,
  onChange,
}: {
  value: ProductColor[];
  onChange: (value: ProductColor[]) => void;
}) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#0b0b0b");

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed || value.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, { name: trimmed, hex: hex.toUpperCase() }]);
    setName("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          aria-label="Color swatch"
          className="h-10 w-12 shrink-0 cursor-pointer rounded-xl border border-line bg-white p-1"
        />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Color name, e.g. Black"
          aria-label="Color name"
        />
        <Button variant="secondary" onClick={add} disabled={!name.trim()} aria-label="Add color">
          <Plus className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((color) => (
            <li
              key={color.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pr-1 pl-1.5 text-xs font-semibold"
            >
              <span className="h-4 w-4 rounded-full ring-1 ring-ink/10" style={{ background: color.hex }} aria-hidden />
              {color.name}
              <span className="text-muted">{color.hex}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((c) => c.name !== color.name))}
                className="rounded-full p-0.5 hover:bg-ink/5"
                aria-label={`Remove ${color.name}`}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
