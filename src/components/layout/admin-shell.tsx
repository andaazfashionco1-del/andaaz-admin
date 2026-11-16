"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FullScreenLoader } from "@/components/ui/spinner";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/format";
import { BrandLogo } from "./brand-logo";
import { Logo, SidebarNav } from "./sidebar";

/** Auth guard + sidebar/topbar chrome for every admin page. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !token) {
      queryClient.clear();
      router.replace("/login");
    }
  }, [hydrated, token, router, queryClient]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  if (!hydrated || !token) return <FullScreenLoader />;

  const initials = (user?.name ?? "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-8 bg-ink py-6 lg:flex">
        <Logo />
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn("fixed inset-0 z-40 lg:hidden", drawerOpen ? "visible" : "invisible")}
        aria-hidden={!drawerOpen}
      >
        <div
          className={cn("absolute inset-0 bg-ink/50 transition-opacity", drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          id="mobile-nav"
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-8 bg-ink py-5 transition-transform",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between pr-3">
            <Logo />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <SidebarNav onNavigate={() => setDrawerOpen(false)} />
        </aside>
      </div>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-paper/85 px-4 backdrop-blur sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="-ml-2 rounded-full p-2 hover:bg-ink/5 lg:hidden"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          aria-controls="mobile-nav"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <Link href="/" className="lg:hidden" aria-label="Andaaz admin home">
          <BrandLogo tone="dark" className="h-6" />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-bold text-lime"
              aria-hidden
            >
              {initials}
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white px-3 text-sm font-semibold hover:border-ink/30"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
