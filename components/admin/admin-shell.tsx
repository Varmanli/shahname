import type { ReactNode } from "react";

import { AdminMobileNav, AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-shah-cream-50 text-foreground dark:bg-[#070707]"
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute right-80 top-[-8rem] h-96 w-96 rounded-full bg-shah-gold-500/12 blur-[110px] dark:bg-shah-gold-500/8" />
        <div className="absolute left-[-7rem] top-72 h-112 w-112 rounded-full bg-shah-lapis-500/12 blur-[120px] dark:bg-shah-lapis-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(184,134,11,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(184,134,11,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-60 dark:opacity-20" />
      </div>
      <AdminSidebar />
      <AdminMobileNav />

      <div className="lg:pr-72">
        <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
