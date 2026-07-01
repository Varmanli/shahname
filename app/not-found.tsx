import type { Metadata } from "next";
import Link from "next/link";

import { SiteLayout } from "@/components/site-layout";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
  description:
    "این برگ از شاهنامه پیدا نشد. به خانه بازگردید یا در میان داستان‌ها و شخصیت‌ها جست‌وجو کنید.",
  robots: { index: false, follow: true },
};

const actions = [
  { href: "/", label: "بازگشت به خانه", primary: true },
  { href: "/stories", label: "مشاهده داستان‌ها", primary: false },
  { href: "/characters", label: "مشاهده شخصیت‌ها", primary: false },
];

export default function NotFound() {
  return (
    <SiteLayout withHeaderOffset disableAnalytics>
      <main
        dir="rtl"
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-32 text-center text-shah-black-900 dark:text-shah-cream-100"
      >
        {/* درخشش‌های محیطی نرم */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-shah-gold-500/10 blur-[140px] dark:bg-shah-gold-500/12" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 -z-10 h-96 w-96 rounded-full bg-shah-lapis-500/10 blur-[120px]" />

        <section className="relative w-full max-w-2xl">
          {/* کارت الهام‌گرفته از نسخه‌های خطی */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-shah-gold-500/25 bg-white/80 p-10 shadow-2xl shadow-shah-black-900/10 backdrop-blur-2xl dark:border-shah-gold-400/20 dark:bg-shah-black-900/70 md:p-16">
            {/* قاب تزئینی داخلی */}
            <div className="pointer-events-none absolute inset-4 rounded-[2rem] border border-shah-gold-500/15 dark:border-white/10" />
            <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-shah-gold-500/10 blur-3xl" />

            <div className="relative">
              {/* عدد ۴۰۴ طلایی */}
              <p className="text-7xl font-black tracking-tight text-shah-gold-500 drop-shadow-sm md:text-8xl">
                ۴۰۴
              </p>

              {/* جداکننده تزئینی */}
              <div className="mx-auto mt-6 flex items-center justify-center gap-3">
                <span className="h-1 w-1 rounded-full bg-shah-gold-500" />
                <span className="h-px w-16 bg-linear-to-l from-transparent via-shah-gold-500/60 to-transparent" />
                <span className="h-2 w-2 rotate-45 bg-shah-gold-500 shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
                <span className="h-px w-16 bg-linear-to-r from-transparent via-shah-gold-500/60 to-transparent" />
                <span className="h-1 w-1 rounded-full bg-shah-gold-500" />
              </div>

              <h1 className="mt-8 text-3xl font-black leading-tight text-shah-black-950 dark:text-white md:text-4xl">
                این برگ از شاهنامه پیدا نشد
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-sm font-semibold leading-8 text-shah-black-500 dark:text-zinc-300 md:text-base">
                شاید این روایت در گذر زمان گم شده باشد، اما می‌توانید به خانه
                بازگردید یا در میان داستان‌ها و شخصیت‌ها جست‌وجو کنید.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={
                      action.primary
                        ? "inline-flex h-13 items-center justify-center rounded-2xl bg-shah-lapis-800 px-7 text-sm font-black text-shah-gold-100 shadow-lg shadow-shah-lapis-900/20 transition hover:-translate-y-0.5 hover:bg-shah-lapis-700 hover:text-white dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
                        : "inline-flex h-13 items-center justify-center rounded-2xl border border-shah-gold-500/30 bg-white/60 px-7 text-sm font-black text-shah-gold-800 shadow-sm transition hover:-translate-y-0.5 hover:border-shah-gold-500/60 hover:bg-shah-gold-500 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-shah-gold-100 dark:hover:bg-shah-gold-500 dark:hover:text-shah-black-950"
                    }
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
