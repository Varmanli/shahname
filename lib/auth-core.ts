const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = "shahname_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

/**
 * آدرس عمومی سایت برای ساخت ریدایرکت‌های مطلق.
 *
 * `request.url` در پشت پراکسی/کانتینر می‌تواند حاوی آدرس داخلی سرور
 * (مثل `http://0.0.0.0:3000`) باشد، پس هرگز مستقیم استفاده نمی‌شود.
 */
export function getPublicOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const headers = request.headers;
  const forwardedHost = headers.get("x-forwarded-host");
  const host = forwardedHost ?? headers.get("host");
  const protocol =
    headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");

  if (host) return `${protocol}://${host}`;

  return request.url;
}

type AdminSessionPayload = {
  exp: number;
  role: "admin";
  sub: "dashboard";
};

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function constantTimeEqual(left: string, right: string) {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    diff |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return diff === 0;
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return bytesToBase64Url(new Uint8Array(signature));
}

const DEV_ADMIN_PASSWORD = "shahname-admin";

export function getAdminPassword() {
  const value = process.env.ADMIN_PASSWORD;

  if (value) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_PASSWORD is not set. Set a strong ADMIN_PASSWORD in the production environment before starting the app.",
    );
  }

  return DEV_ADMIN_PASSWORD;
}

export function isQuickAdminAccessEnabled() {
  return (
    process.env.ADMIN_QUICK_ACCESS === "true" ||
    (process.env.NODE_ENV !== "production" &&
      process.env.ADMIN_QUICK_ACCESS !== "false")
  );
}

export function getAuthSecret() {
  const value = process.env.AUTH_SECRET;

  if (value) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is not set. Generate one with `openssl rand -base64 32` and set it in the production environment before starting the app.",
    );
  }

  return `shahname-dev:${getAdminPassword()}`;
}

export function verifyAdminPassword(password: string) {
  return constantTimeEqual(password, getAdminPassword());
}

export async function createAdminSessionToken() {
  const payload: AdminSessionPayload = {
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
    role: "admin",
    sub: "dashboard",
  };
  const body = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(body, getAuthSecret());

  return `${body}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string) {
  if (!token) return false;

  const [body, signature, extra] = token.split(".");

  if (!body || !signature || extra) return false;

  const expectedSignature = await sign(body, getAuthSecret());

  if (!constantTimeEqual(signature, expectedSignature)) return false;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(body)),
    ) as Partial<AdminSessionPayload>;

    return (
      payload.sub === "dashboard" &&
      payload.role === "admin" &&
      typeof payload.exp === "number" &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}
