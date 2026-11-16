import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <div role="status" className={cn("flex items-center justify-center py-12 text-muted", className)}>
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Spinner />
    </div>
  );
}
