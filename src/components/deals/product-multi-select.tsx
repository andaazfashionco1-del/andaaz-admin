"use client";

import { useQueries } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { MediaPreview } from "@/components/media/media-preview";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { api } from "@/lib/api";
import { cn, formatMoney } from "@/lib/format";
import { queryKeys, useProducts } from "@/lib/queries";
import type { Product } from "@/lib/types";

/** Searchable multi-select of products, value is a list of product ids. */
export function ProductMultiSelect({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search);
  const { data, isLoading } = useProducts({ search: debounced, page: 1, limit: 20 });

  const selected = useQueries({
    queries: value.map((id) => ({
      queryKey: queryKeys.product(id),
      queryFn: () => api<Product>(`/admin/products/${id}`),
    })),
  });

  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selected products">
          {value.map((id, i) => (
            <li
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-ink py-0.5 pr-1 pl-2.5 text-xs font-semibold text-white"
            >
              {selected[i]?.data?.name ?? "Loading…"}
              <button
                type="button"
                onClick={() => toggle(id)}
                className="rounded-full p-0.5 hover:bg-white/20"
                aria-label={`Remove ${selected[i]?.data?.name ?? "product"}`}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <SearchInput label="Search products" placeholder="Search products…" value={search} onChange={setSearch} />
      <div className="max-h-64 overflow-y-auto rounded-xl border border-line bg-white">
        {isLoading ? (
          <Spinner className="py-6" />
        ) : !data?.items.length ? (
          <p className="px-3 py-4 text-sm text-muted">No products found.</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.items.map((p) => {
              const checked = value.includes(p.id);
              const cover = p.media[0];
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggle(p.id)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-paper/60"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                        checked ? "border-ink bg-ink text-lime" : "border-line",
                      )}
                    >
                      {checked && <Check className="h-3.5 w-3.5" aria-hidden />}
                    </span>
                    {cover ? (
                      <MediaPreview url={cover.url} type={cover.type} className="h-8 w-8 shrink-0 rounded-md" />
                    ) : (
                      <span className="h-8 w-8 shrink-0 rounded-md bg-paper" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-muted">{formatMoney(p.price)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
