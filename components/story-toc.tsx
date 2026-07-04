"use client";

import { useEffect, useState } from "react";

import { SmoothScrollLink } from "@/components/smooth-scroll-link";

type StoryTocItem = {
  id: string;
  title: string;
};

type StoryTocProps = {
  items: StoryTocItem[];
};

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export function StoryToc({ items }: StoryTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.1, 0.35, 0.6],
      },
    );

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <div className="w-full min-w-0">
      <nav
        className="relative w-full min-w-0 overflow-hidden rounded-[1.4rem] border border-shah-gold-500/12 bg-white/78 p-2 text-right shadow-[0_14px_35px_rgba(24,24,27,0.06)] backdrop-blur-2xl dark:border-white/8 dark:bg-zinc-950/50 dark:shadow-[0_18px_45px_rgba(0,0,0,0.34)]"
        aria-label="فهرست بخش‌های روایت"
        dir="rtl"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[1.4rem] ring-1 ring-inset ring-white/65 dark:ring-white/5" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-shah-gold-400/12 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-2 flex items-center justify-between gap-2 rounded-2xl border border-shah-gold-500/10 bg-shah-cream-50/60 px-2.5 py-2 dark:border-white/8 dark:bg-white/3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-shah-gold-400/14 ring-1 ring-shah-gold-500/18">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-shah-gold-400 opacity-55" />
                <span className="relative h-2 w-2 rounded-full bg-shah-gold-500 shadow-[0_0_12px_rgba(246,184,31,0.45)]" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-[11px] font-black text-shah-gold-700 dark:text-shah-gold-300">
                  فهرست روایت
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-full border border-shah-gold-500/12 bg-white/65 px-2.5 py-1 text-[10px] font-black text-shah-gold-700 dark:border-white/8 dark:bg-black/20 dark:text-shah-gold-300">
              {toFaNumber(items.length)} بخش
            </div>
          </div>

          <div className="grid gap-1.5 pr-0.5 pl-1">
            {items.map((item, index) => {
              const isActive = activeId === item.id;

              return (
                <SmoothScrollLink
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? "border-shah-gold-400/45 bg-linear-to-l from-shah-gold-500 via-shah-gold-500 to-shah-gold-600 text-[#071426] shadow-[0_10px_24px_rgba(246,184,31,0.22)]"
                      : "border-transparent bg-white/35 text-zinc-600 hover:border-shah-gold-400/22 hover:bg-shah-gold-50/80 hover:text-zinc-950 dark:bg-white/[0.022] dark:text-zinc-400 dark:hover:border-shah-gold-400/18 dark:hover:bg-white/5 dark:hover:text-zinc-100"
                  }`}
                >
                  {isActive ? (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.38),transparent_34%)]" />
                      <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-white/40" />
                    </>
                  ) : null}

                  <div className="relative z-10 flex min-w-0 items-center gap-2 px-2 py-2">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black tabular-nums transition-all duration-300 ${
                        isActive
                          ? "bg-white/28 text-[#071426] ring-1 ring-white/35"
                          : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200/75 group-hover:bg-shah-gold-400 group-hover:text-[#071426] group-hover:ring-shah-gold-400 dark:bg-zinc-900 dark:text-zinc-500 dark:ring-white/8 dark:group-hover:bg-shah-gold-400"
                      }`}
                    >
                      {toFaNumber(index + 1)}
                    </div>

                    <span
                      className={`min-w-0 flex-1 truncate text-xs font-black leading-6 tracking-tight sm:text-sm ${
                        isActive ? "text-[#071426]" : ""
                      }`}
                    >
                      {item.title}
                    </span>

                    <span
                      className={`block shrink-0 rounded-full transition-all duration-300 ${
                        isActive
                          ? "h-7 w-1.5 bg-[#071426] shadow-[0_0_12px_rgba(7,20,38,0.28)]"
                          : "h-4 w-1 bg-shah-gold-400/35 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </div>
                </SmoothScrollLink>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
