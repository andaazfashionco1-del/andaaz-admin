import { cn } from "@/lib/format";

export type BadgeTone = "neutral" | "dark" | "lime" | "pink" | "amber" | "blue" | "green";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-ink/5 text-ink/70",
  dark: "bg-ink text-white",
  lime: "bg-lime text-ink",
  pink: "bg-pink/10 text-pink",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-sky-100 text-sky-800",
  green: "bg-emerald-100 text-emerald-800",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
