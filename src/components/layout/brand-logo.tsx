import Image from "next/image";
import { cn } from "@/lib/format";

/** Official calligraphic wordmark. `light` = cream ink for dark surfaces, `dark` = dark ink for light surfaces. */
export function BrandLogo({ tone, className, eager }: { tone: "light" | "dark"; className?: string; eager?: boolean }) {
  return (
    <Image
      src={`/brand/logo-${tone}.png`}
      alt="Andaaz"
      width={1066}
      height={355}
      loading={eager ? "eager" : undefined}
      className={cn(className ?? "h-[30px]", "w-auto")}
    />
  );
}

/** "A" monogram. */
export function BrandIcon({ tone, className }: { tone: "light" | "dark"; className?: string }) {
  return (
    <Image src={`/brand/icon-${tone}.png`} alt="Andaaz" width={512} height={512} className={className ?? "h-8 w-8"} />
  );
}
