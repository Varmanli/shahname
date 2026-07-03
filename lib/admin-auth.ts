import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionTokenDebug } from "@/lib/auth-core";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const result = await verifyAdminSessionTokenDebug(token);

  // TEMP debug logging — this layout guard runs *after* proxy.ts already
  // allowed the request through, so a failure logged here (with proxy.ts
  // having logged authenticated: true for the same request) would point at
  // an Edge-vs-Node runtime inconsistency rather than a cookie/proxy issue.
  if (!result.ok) {
    console.log("[admin-auth] layout-check-failed", {
      hasCookie: Boolean(token),
      reason: result.reason,
    });
  }

  return result.ok;
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete({ name: ADMIN_SESSION_COOKIE, path: "/" });
}

export async function requireAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);

  const result = await verifyAdminSessionTokenDebug(token);

  if (result.ok) return null;

  // TEMP debug logging — same reasoning as isAdminAuthenticated above.
  console.log("[admin-auth] api-check-failed", {
    path: new URL(request.url).pathname,
    hasCookie: Boolean(token),
    reason: result.reason,
  });

  return Response.json(
    { message: "برای انجام این عملیات باید وارد پنل مدیریت شوید." },
    { status: 401 },
  );
}
