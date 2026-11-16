import { cn } from "@/lib/format";

/** Pill-style segmented filter. */
export function Tabs<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
              active ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-line hover:text-ink",
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cn("ml-1.5 text-xs", active ? "text-lime" : "text-muted")}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
