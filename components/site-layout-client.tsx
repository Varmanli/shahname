"use client";

import type { ReactNode } from "react";

import { AnalyticsTracker } from "@/components/analytics-tracker";
import { BackToTopButton } from "@/components/back-to-top-button";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useSiteChrome } from "@/components/site-chrome-context";

type SiteLayoutClientProps = {
  children: ReactNode;
  withHeaderOffset?: boolean;
  disableAnalytics?: boolean;
};

export function SiteLayoutClient({
  children,
  withHeaderOffset = false,
  disableAnalytics = false,
}: SiteLayoutClientProps) {
  const { isImmersiveMode } = useSiteChrome();

  return (
    <div
      data-reading-mode={isImmersiveMode ? "active" : "inactive"}
      className={`flex min-h-screen flex-col bg-background text-foreground font-sans ${
        isImmersiveMode ? "reading-mode-active" : ""
      }`}
    >
      {isImmersiveMode ? null : <Header />}
      <div className={withHeaderOffset && !isImmersiveMode ? "" : undefined}>
        {children}
      </div>
      <Footer />
      <BackToTopButton />
      {disableAnalytics ? null : <AnalyticsTracker />}
    </div>
  );
}
