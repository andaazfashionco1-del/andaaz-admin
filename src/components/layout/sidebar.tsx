"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";
import { BrandLogo } from "./brand-logo";
import { navItems } from "./nav-items";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-6" aria-label="Andaaz admin home">
      <BrandLogo tone="light" eager />
      <span className="rounded-full bg-lime px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-ink uppercase">
        Admin
      </span>
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex flex-col gap-1 px-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition",
              active ? "bg-white text-ink" : "text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4.5 w-4.5" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
