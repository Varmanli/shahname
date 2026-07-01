"use client";

import { useState } from "react";

export function LineageInfoButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="راهنمای تبارنامه"
        onClick={() => setIsOpen(true)}
        className="
          group mt-4 inline-flex size-9 shrink-0 items-center justify-center rounded-full
          border border-shah-gold-500/30 bg-white/75 text-shah-gold-700
          shadow-sm backdrop-blur transition-all duration-300
          hover:-translate-y-0.5 hover:border-shah-gold-500/60 hover:bg-shah-gold-50
          hover:shadow-[0_10px_30px_rgba(212,175,55,0.18)]
          dark:bg-white/5 dark:text-shah-gold-300 dark:hover:bg-shah-gold-500/10
        "
      >
        <span className="text-lg font-black leading-none">!</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            dir="rtl"
            className="w-full max-w-lg rounded-[1.75rem] border border-shah-gold-500/20 bg-white p-7 text-right shadow-2xl dark:bg-shah-black-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                راهنمای تبارنامه
              </h3>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full px-3 py-1 text-sm font-bold text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-white/10"
              >
                بستن
              </button>
            </div>

            <p className="text-sm font-semibold leading-8 text-zinc-600 dark:text-zinc-300">
              در این بخش فقط تبارنامه‌های منتشرشده در پنل مدیریت نمایش داده
              می‌شوند. ریشه هر تبار در بالاترین بخش نقشه قرار دارد و نسل‌های
              بعدی در امتداد آن گسترش پیدا می‌کنند.
            </p>

            <p className="mt-4 text-sm leading-8 text-zinc-500 dark:text-zinc-400">
              خط‌های پیوسته نشان‌دهنده رابطه مستقیم پدر/مادر و فرزند هستند.
              خط‌های نقطه‌چین برای وابستگی‌های دودمانی یا روایی استفاده می‌شوند؛
              یعنی الزاماً رابطه مستقیم پدر و فرزندی نیستند.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
