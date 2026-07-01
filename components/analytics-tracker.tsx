"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * ردیاب سبک و حریم‌خصوصی‌محور بازدید صفحه‌های عمومی.
 * در SiteLayout سوار می‌شود، پس فقط روی صفحه‌های عمومی اجرا می‌شود (نه پنل ادمین).
 * ارسال به‌صورت fire-and-forget است و رندر یا تعامل صفحه را کند نمی‌کند.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // محافظ سمت کلاینت: مسیرهای غیرعمومی هرگز ارسال نمی‌شوند.
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next")
    ) {
      return;
    }

    // هر مسیر در یک بار بارگذاری صفحه فقط یک‌بار ارسال می‌شود (رفرش/ناوبری مجدد نه).
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    const payload = JSON.stringify({ path: pathname });

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track",
          new Blob([payload], { type: "application/json" }),
        );
        return;
      }

      void fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // خطاهای آمار بی‌اهمیت‌اند و نادیده گرفته می‌شوند.
      });
    } catch {
      // هر خطایی در ردیابی نباید روی تجربه کاربر اثر بگذارد.
    }
  }, [pathname]);

  return null;
}
