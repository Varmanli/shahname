import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  getPublicOrigin,
  isQuickAdminAccessEnabled,
  verifyAdminPassword,
} from "@/lib/auth-core";

export const dynamic = "force-dynamic";

function getSafeRedirectPath(value: FormDataEntryValue | null) {
  if (
    typeof value === "string" &&
    value.startsWith("/admin") &&
    !value.startsWith("/admin/login") &&
    !value.startsWith("/admin/logout")
  ) {
    return value;
  }

  return "/admin";
}

function redirectToLogin(request: Request, next: string, error: string) {
  const params = new URLSearchParams({ next, error });

  return NextResponse.redirect(
    new URL(`/admin/login?${params.toString()}`, getPublicOrigin(request)),
    { status: 303 },
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const next = getSafeRedirectPath(formData.get("next"));
  const password = formData.get("password");
  const quick = formData.get("quick") === "true";

  if (quick) {
    if (!isQuickAdminAccessEnabled()) {
      return redirectToLogin(request, next, "ورود سریع روی این محیط فعال نیست.");
    }
  } else if (typeof password !== "string" || !password.trim()) {
    return redirectToLogin(request, next, "رمز عبور را وارد کنید.");
  } else if (!verifyAdminPassword(password)) {
    return redirectToLogin(request, next, "رمز عبور درست نیست.");
  }

  const response = NextResponse.redirect(new URL(next, getPublicOrigin(request)), {
    status: 303,
  });
  const token = await createAdminSessionToken();

  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    token,
    getAdminSessionCookieOptions(request),
  );

  return response;
}
