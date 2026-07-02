import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await isAdminAuthenticated())) {
    const pathname = (await headers()).get("x-shahname-pathname") ?? "/admin";

    redirect(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }

  return <AdminShell>{children}</AdminShell>;
}
