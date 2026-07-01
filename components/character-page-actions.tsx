"use client";

import { useState } from "react";

export function CharacterPageActions({ name }: { name: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [shared, setShared] = useState(false);

  async function sharePage() {
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      setShared(false);
    }
  }

  return (
    <div className="mt-5 flex justify-center gap-2">
      <button
        type="button"
        onClick={() => setBookmarked((value) => !value)}
        className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-black transition ${
          bookmarked
            ? "border-shah-gold-500 bg-shah-gold-500 text-white dark:text-shah-black-950"
            : "border-shah-gold-500/25 bg-white/60 text-shah-gold-800 hover:border-shah-gold-500 dark:bg-white/5 dark:text-shah-gold-100"
        }`}
      >
        ⭐ {bookmarked ? "نشان‌شده" : "نشان کردن"}
      </button>
      <button
        type="button"
        onClick={sharePage}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-shah-gold-500/25 bg-white/60 px-4 text-xs font-black text-shah-gold-800 transition hover:border-shah-gold-500 dark:bg-white/5 dark:text-shah-gold-100"
      >
        ↗ {shared ? "کپی شد" : "اشتراک"}
      </button>
    </div>
  );
}
