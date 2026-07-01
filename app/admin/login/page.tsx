import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isQuickAdminAccessEnabled } from "@/lib/auth-core";

export const metadata: Metadata = {
  title: "ورود به پنل مدیریت",
};

function getReturnTo(searchParams: Record<string, string | string[] | undefined>) {
  const next = searchParams.next;

  if (
    typeof next === "string" &&
    next.startsWith("/admin") &&
    !next.startsWith("/admin/login") &&
    !next.startsWith("/admin/logout")
  ) {
    return next;
  }

  return "/admin";
}

function getError(searchParams: Record<string, string | string[] | undefined>) {
  return typeof searchParams.error === "string" ? searchParams.error : undefined;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const resolvedSearchParams = await searchParams;

  return (
    <AdminLoginForm
      error={getError(resolvedSearchParams)}
      quickAccess={isQuickAdminAccessEnabled()}
      returnTo={getReturnTo(resolvedSearchParams)}
    />
  );
}
