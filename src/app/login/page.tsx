import type { Metadata } from "next";
import { BrandIcon } from "@/components/layout/brand-logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-ink">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <BrandIcon tone="light" className="h-14 w-14" />
        <div>
          <p className="font-display text-5xl leading-tight font-semibold">
            Run the store.
            <br />
            <span className="text-lime">Own the look.</span>
          </p>
          <p className="mt-4 max-w-sm text-white/60">
            Products, drops, deals and orders — everything Andaaz, in one place.
          </p>
        </div>
        <span className="text-xs text-white/40">© Andaaz</span>
        <div
          className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-lime/15 blur-3xl"
          aria-hidden
        />
      </div>
      <div className="flex flex-1 items-center justify-center bg-paper px-4 py-12 lg:rounded-l-[2.5rem]">
        <LoginForm />
      </div>
    </div>
  );
}
