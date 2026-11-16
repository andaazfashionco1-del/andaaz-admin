import { Suspense } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { FullScreenLoader } from "@/components/ui/spinner";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
