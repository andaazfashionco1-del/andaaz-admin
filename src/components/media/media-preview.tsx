import { Play } from "lucide-react";
import { cn } from "@/lib/format";
import type { MediaType } from "@/lib/types";

/** Square-ish media thumbnail. Videos render a muted first frame (or full player when `controls`). */
export function MediaPreview({
  url,
  type,
  alt = "",
  controls,
  className,
}: {
  url: string;
  type: MediaType;
  alt?: string;
  controls?: boolean;
  className?: string;
}) {
  if (type === "VIDEO") {
    return (
      <div className={cn("relative overflow-hidden bg-ink", className)}>
        <video
          src={controls ? url : `${url}#t=0.1`}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
          controls={controls}
          aria-label={alt || "Video"}
        />
        {!controls && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink">
              <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden />
            </span>
          </span>
        )}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote uploads, no next/image config by design
    <img src={url} alt={alt} loading="lazy" className={cn("bg-paper object-cover", className)} />
  );
}
