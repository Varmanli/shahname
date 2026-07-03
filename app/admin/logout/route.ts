import { redirect } from "next/navigation";

import { clearAdminSessionCookie } from "@/lib/admin-auth";

/**
 * فقط POST نشست را پاک می‌کند. GET عمداً کوکی را پاک نمی‌کند — لینک‌های
 * Next.js به‌صورت پیش‌فرض prefetch می‌شوند (حتی بدون کلیک کاربر) و اگر خروج
 * روی GET پیاده می‌شد، همین prefetch خودکار کاربر را از نشست بیرون می‌انداخت.
 */
export async function POST() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export function GET() {
  redirect("/admin/login");
}
