import { cn } from "@/lib/format";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  /** Hide the visible label (still announced to screen readers). */
  hideLabel?: boolean;
  disabled?: boolean;
};

export function Switch({ checked, onChange, label, description, hideLabel, disabled }: SwitchProps) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50",
        checked ? "bg-ink" : "bg-line",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full shadow transition",
          checked ? "translate-x-5.5 bg-lime" : "translate-x-0.5 bg-white",
        )}
      />
    </button>
  );

  if (hideLabel) return control;

  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-line bg-white px-3.5 py-3">
      <span className="flex flex-col">
        <span className="text-sm font-semibold">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </span>
      {control}
    </label>
  );
}
