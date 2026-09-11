"use client";

import { useLayoutEffect } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
  }, [pathname]);

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
