const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = "shahname_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // ۷ روز

/**
 * پروتکل واقعی درخواست از دید مرورگر.
 *
 * پشت یک ریورس‌پراکسی (Traefik/Coolify) اتصال داخلی به کانتینر معمولاً HTTP
 * است حتی وقتی کاربر روی HTTPS است، پس همیشه اول به هدر استاندارد
 * `x-forwarded-proto` اعتماد می‌کنیم و فقط در نبود آن به پروتکل خام درخواست
 * برمی‌گردیم.
 */
export function getRequestProtocol(request: Request): "http" | "https" {
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  if (forwardedProto === "https" || forwardedProto === "http") {
    return forwardedProto;
  }

  return new URL(request.url).protocol === "https:" ? "https" : "http";
}

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
  const protocol = getRequestProtocol(request);

  if (host) return `${protocol}://${host}`;

  return request.url;
}

/**
 * وقتی `NEXT_PUBLIC_SITE_URL` تنظیم شده، پرچم `secure` کوکی را از روی همان
 * مقدار (که ثابت و قابل‌اعتماد است) تعیین می‌کنیم، نه از روی هدرهای
 * پراکسی مثل `x-forwarded-proto` که پشت Traefik/Coolify می‌توانند بسته به
 * تنظیمات پراکسی، هاپ فعلی، یا حتی مسیر درخواست ناسازگار باشند. یک پرچم
 * `secure` که گاهی درست و گاهی غلط تشخیص داده شود دقیقاً همان چیزی است که
 * باعث می‌شود مرورگر کوکی نشست را بین درخواست‌ها گاهی ذخیره و گاهی رد کند.
 */
function isConfiguredPublicOriginHttps(): boolean | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configured) return undefined;

  return configured.toLowerCase().startsWith("https://");
}

/**
 * تنظیمات یکسانِ کوکی نشست ادمین — تنها منبع حقیقت برای مسیر، انقضا و
 * پرچم‌های امنیتی کوکی، تا هیچ‌جای دیگری از کد این مقادیر را جداگانه
 * تکرار نکند و از واگرایی جلوگیری شود.
 *
 * عمداً `domain` تنظیم نمی‌شود — تنظیم آن روی مقدار اشتباه (مثل
 * `0.0.0.0`، هاست داخلی کانتینر یا `localhost`) باعث می‌شود مرورگر کوکی
 * را برای دامنه واقعی سایت ذخیره نکند.
 */
export function getAdminSessionCookieOptions(request: Request) {
  return {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure: isConfiguredPublicOriginHttps() ?? getRequestProtocol(request) === "https",
  };
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

/**
 * راز امضای JWT نشست ادمین.
 *
 * همیشه از `process.env.JWT_SECRET` خوانده می‌شود — نه به‌صورت پویا
 * دوباره ساخته می‌شود و نه مقدار پیش‌فرض تصادفی/مشتق‌شده دارد. اگر تنظیم
 * نشده باشد، در هر محیطی (نه فقط production) با خطای واضح متوقف می‌شود؛
 * چون یک مقدار پیش‌فرض ساکت یعنی امضا/راستی‌آزمایی JWT بین ری‌استارت‌ها یا
 * نمونه‌های مختلف سرور می‌تواند ناسازگار شود و نشست ادمین را نامعتبر کند.
 */
export function getJwtSecret() {
  const value = process.env.JWT_SECRET;

  if (value) return value;

  throw new Error(
    "JWT_SECRET is not set. Generate one with `openssl rand -base64 32` and set it as an environment variable before starting the app.",
  );
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
  const signature = await sign(body, getJwtSecret());

  return `${body}.${signature}`;
}

export type AdminAuthDebugResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "missing-cookie"
        | "missing-secret"
        | "malformed-token"
        | "invalid-signature"
        | "expired-token";
    };

/**
 * نسخهٔ قابل‌مشاهدهٔ راستی‌آزمایی نشست — علت دقیق رد شدن توکن را برمی‌گرداند
 * تا فقط برای لاگ‌های امن دیباگ استفاده شود (هرگز برای پاسخ به کلاینت).
 * `verifyAdminSessionToken` یک پوستهٔ نازک روی همین تابع است، تا منطق
 * راستی‌آزمایی دقیقاً یک‌جا نگه داشته شود.
 */
export async function verifyAdminSessionTokenDebug(
  token?: string,
): Promise<AdminAuthDebugResult> {
  if (!token) return { ok: false, reason: "missing-cookie" };

  const [body, signature, extra] = token.split(".");

  if (!body || !signature || extra) {
    return { ok: false, reason: "malformed-token" };
  }

  let secret: string;

  try {
    secret = getJwtSecret();
  } catch {
    return { ok: false, reason: "missing-secret" };
  }

  const expectedSignature = await sign(body, secret);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return { ok: false, reason: "invalid-signature" };
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(body)),
    ) as Partial<AdminSessionPayload>;

    if (
      payload.sub !== "dashboard" ||
      payload.role !== "admin" ||
      typeof payload.exp !== "number"
    ) {
      return { ok: false, reason: "malformed-token" };
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return { ok: false, reason: "expired-token" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "malformed-token" };
  }
}

export async function verifyAdminSessionToken(token?: string) {
  const result = await verifyAdminSessionTokenDebug(token);

  return result.ok;
}
