import type { ReactNode } from "react";
import { headers } from "next/headers";

import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = (await headers()).get("x-shahname-pathname");

  if (pathname === "/admin/login") {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-shah-cream-50 text-foreground dark:bg-[#070707]"
      >
        {children}
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
