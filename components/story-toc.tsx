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
    <nav
      className="
    w-full min-w-0 overflow-hidden rounded-4xl
    border border-shah-gold-500/10
    bg-white/70 p-4
    shadow-[0_20px_50px_rgba(24,24,27,0.05)]
    backdrop-blur-2xl
    dark:border-white/5 dark:bg-zinc-900/60
    dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]
  "
      aria-label="فهرست بخش‌های روایت"
      dir="rtl"
    >
      {/* Header Section */}
      <div className="mb-5 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-shah-gold-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-shah-gold-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
          </div>
          <p className="text-[11px] font-black tracking-tight text-zinc-500 uppercase dark:text-zinc-400">
            سرفصل‌های روایت
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-shah-gold-500/10 px-3 py-1 dark:bg-shah-gold-500/5">
          <span className="text-[10px] font-black text-shah-gold-600 dark:text-shah-gold-400">
            تعداد:
          </span>
          <span className="text-[11px] font-black tabular-nums text-shah-gold-700 dark:text-shah-gold-300">
            {toFaNumber(items.length)}
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="grid gap-2">
        {items.map((item, index) => {
          const isActive = activeId === item.id;

          return (
            <SmoothScrollLink
              key={item.id}
              href={`#${item.id}`}
              className={`
            group relative flex items-center gap-4
            rounded-[1.2rem] border p-2.5
            transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${
              isActive
                ? "border-shah-gold-500/20 bg-linear-to-l from-shah-gold-500 to-shah-gold-600 text-white shadow-lg shadow-shah-gold-500/20"
                : "border-transparent text-zinc-600 hover:bg-shah-gold-500/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }
          `}
            >
              {/* Active Overlay Effect */}
              {isActive && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-10" />
              )}

              {/* Index Number */}
              <div
                className={`
              relative z-10 flex size-9 shrink-0 items-center justify-center
              rounded-xl text-[13px] font-black transition-all duration-500
              ${
                isActive
                  ? "bg-white/20 text-white backdrop-blur-md"
                  : "bg-zinc-100 text-zinc-500 group-hover:bg-shah-gold-500 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-500"
              }
            `}
              >
                {toFaNumber(index + 1)}
              </div>

              {/* Title Text */}
              <span className="relative z-10 min-w-0 flex-1 truncate text-sm font-bold leading-relaxed tracking-tight">
                {item.title}
              </span>

              {/* Dynamic Indicator */}
              <div className="relative flex h-8 w-1.5 items-center justify-center">
                <div
                  className={`
                h-full w-full rounded-full transition-all duration-500
                ${
                  isActive
                    ? "bg-white scale-y-100 opacity-100 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                    : "bg-shah-gold-500/20 scale-y-50 opacity-0 group-hover:opacity-100"
                }
              `}
                />
              </div>
            </SmoothScrollLink>
          );
        })}
      </div>
    </nav>
  );
}
