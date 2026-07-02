import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth-core";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();

  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
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

  if (await verifyAdminSessionToken(token)) return null;

  return Response.json(
    { message: "برای انجام این عملیات باید وارد پنل مدیریت شوید." },
    { status: 401 },
  );
}
