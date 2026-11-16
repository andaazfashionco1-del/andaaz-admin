import { cn } from "@/lib/format";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border border-line bg-white p-4 sm:p-5", className)}>{children}</section>;
}

export function CardHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      <h2 className="text-base font-semibold">{title}</h2>
      {action}
    </div>
  );
}
