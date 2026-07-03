import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  getPublicOrigin,
  getRequestProtocol,
  verifyAdminSessionTokenDebug,
} from "@/lib/auth-core";

const loginPath = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-shahname-pathname", pathname);

  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authResult = await verifyAdminSessionTokenDebug(cookieValue);
  const isAuthenticated = authResult.ok;
  const origin = getPublicOrigin(request);

  // TEMP debug logging for the production "randomly logged out of admin"
  // investigation — safe fields only (never the cookie/token value or
  // secrets). Remove once the root cause is confirmed fixed.
  console.log("[admin-auth] check", {
    path: pathname,
    hasCookie: Boolean(cookieValue),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    host: request.headers.get("host"),
    detectedProtocol: getRequestProtocol(request),
    authenticated: isAuthenticated,
    reason: authResult.ok ? undefined : authResult.reason,
  });

  if (pathname === loginPath) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", origin));
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!isAuthenticated) {
    const loginUrl = new URL(loginPath, origin);
    loginUrl.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
