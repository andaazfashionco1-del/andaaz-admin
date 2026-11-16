import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper">
        <Icon className="h-5 w-5 text-muted" aria-hidden />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-pink/30 bg-pink/5 px-6 py-8 text-center" role="alert">
      <p className="font-semibold text-pink">Couldn&apos;t load data</p>
      <p className="mt-1 text-sm text-muted">{error instanceof Error ? error.message : "Unknown error"}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 text-sm font-semibold underline">
          Try again
        </button>
      )}
    </div>
  );
}
