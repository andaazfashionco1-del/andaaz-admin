"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { errorMessage } from "@/lib/format";
import type { LoginResponse } from "@/lib/types";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (hydrated && token) router.replace("/");
  }, [hydrated, token, router]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const res = await api<LoginResponse>("/auth/login", { method: "POST", body: values, auth: false });
      if (res.user.role === "CUSTOMER") {
        setServerError("This account does not have admin access.");
        return;
      }
      setSession(res.accessToken, res.user);
    } catch (error) {
      setServerError(errorMessage(error));
    }
  });

  return (
    <div className="w-full max-w-sm">
      <BrandLogo tone="dark" className="h-16" eager />
      <h1 className="mt-8 text-3xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to the Andaaz admin panel.</p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@andaaz.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>
        {serverError && (
          <p className="rounded-xl bg-pink/10 px-3 py-2 text-sm font-medium text-pink" role="alert">
            {serverError}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="mt-2 h-11">
          Sign in
        </Button>
      </form>
    </div>
  );
}
