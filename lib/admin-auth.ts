import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/auth-core";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();

  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    name: ADMIN_SESSION_COOKIE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: await createAdminSessionToken(),
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE);
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
