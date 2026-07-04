import type { ReactNode } from "react";

import { SiteChromeProvider } from "@/components/site-chrome-context";
import { SiteLayoutClient } from "@/components/site-layout-client";

type SiteLayoutProps = {
  children: ReactNode;
  withHeaderOffset?: boolean;
  /** غیرفعال‌کردن ثبت بازدید (مثلا برای صفحه ۴۰۴ تا مسیرهای نامعتبر ثبت نشوند). */
  disableAnalytics?: boolean;
};

export function SiteLayout({
  children,
  withHeaderOffset = false,
  disableAnalytics = false,
}: SiteLayoutProps) {
  return (
    <SiteChromeProvider>
      <SiteLayoutClient
        withHeaderOffset={withHeaderOffset}
        disableAnalytics={disableAnalytics}
      >
        {children}
      </SiteLayoutClient>
    </SiteChromeProvider>
  );
}
