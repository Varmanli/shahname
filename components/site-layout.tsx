import type { ReactNode } from "react";

import { AnalyticsTracker } from "@/components/analytics-tracker";
import { BackToTopButton } from "@/components/back-to-top-button";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

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
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <Header />
      <div className={withHeaderOffset ? "" : undefined}>{children}</div>
      <Footer />
      <BackToTopButton />
      {disableAnalytics ? null : <AnalyticsTracker />}
    </div>
  );
}
