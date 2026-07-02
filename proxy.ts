import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  getPublicOrigin,
  verifyAdminSessionToken,
} from "@/lib/auth-core";

const loginPath = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-shahname-pathname", pathname);

  const isAuthenticated = await verifyAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );
  const origin = getPublicOrigin(request);

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
