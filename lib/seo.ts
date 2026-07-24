/**
 * مرکز تنظیمات SEO سایت شاهنامه‌سرا.
 *
 * آدرس پایه برای محیط تولید از `NEXT_PUBLIC_SITE_URL` خوانده می‌شود و در محیط
 * توسعه روی localhost بازمی‌گردد. تمام متادیتاها، sitemap و robots از همین
 * مقدار استفاده می‌کنند تا canonical و Open Graph درست ساخته شوند.
 */

import type { Metadata } from "next";

const FALLBACK_DEV_URL = "http://localhost:3000";

function resolveSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (fromEnv && fromEnv.length > 0) {
    // حذف اسلش انتهایی برای جلوگیری از آدرس‌های تکراری مثل example.com//stories
    return fromEnv.replace(/\/+$/, "");
  }

  // NEXT_PUBLIC_* values are inlined at build time, so this must be set
  // when running `npm run build`, not just at server start.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set. Set it to the production domain (e.g. https://your-domain.com) before running `npm run build`.",
    );
  }

  return FALLBACK_DEV_URL;
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "شاهنامه‌سرا";

export const SITE_TITLE = "شاهنامه‌سرا | روایت‌های ماندگار ایران‌زمین";

export const SITE_DESCRIPTION =
  "شاهنامه‌سرا؛ آرشیو حماسهٔ ایران: روایت‌ها شخصیت‌ها و تبارنامهٔ شاهنامه فردوسی با روایتی مدرن، تصویرسازی سینمایی و تجربه‌ای تعاملی از اسطوره‌های ایران‌زمین.";

/** تصویر پیش‌فرض Open Graph برای صفحاتی که تصویر اختصاصی ندارند. */
export const DEFAULT_OG_IMAGE = "/images/ferdosi.png";

export const SITE_LOCALE = "fa_IR";

export const SITE_KEYWORDS = [
  "شاهنامه",
  "فردوسی",
  "شاهنامه‌سرا",
  "اسطوره‌های ایران",
  "روایت‌های حماسی",
  "شخصیت‌های شاهنامه",
  "تبارنامه شاهنامه",
  "ادبیات فارسی",
  "رستم",
  "حماسه ایرانی",
];

/** آدرس مطلق برای یک مسیر داخلی سایت. */
export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** تبدیل متن HTML‌دار به متن ساده برای استفاده در description. */
export function toPlainText(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&zwnj;/g, "‌")
    .replace(/\s+/g, " ")
    .trim();
}

/** کوتاه‌سازی متن description تا طول مناسب موتورهای جستجو. */
export function truncate(value: string, maxLength = 160) {
  const text = value.trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

/** ساخت description تمیز از یک یا چند منبع متنی. */
export function buildDescription(...sources: Array<string | undefined>) {
  const source = sources.find((item) => toPlainText(item ?? "").length > 0);
  return truncate(toPlainText(source ?? SITE_DESCRIPTION));
}

/**
 * متادیتای استاندارد برای صفحات عمومی ثابت (آرشیوها، درباره، تماس و...).
 * canonical و Open Graph و Twitter را یکجا و هماهنگ می‌سازد.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}
