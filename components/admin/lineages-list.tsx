"use client";

import Link from "next/link";
import { useState } from "react";

import type { Lineage } from "@/types/lineage";

type LineageWithCount = Lineage & {
  characterCount: number;
};

export function LineagesList({
  lineages: initialLineages,
}: {
  lineages: LineageWithCount[];
}) {
  const [lineages, setLineages] = useState(initialLineages);
  const [status, setStatus] = useState("");

  async function removeLineage(lineage: LineageWithCount) {
    const confirmed = window.confirm(`تبارنامه «${lineage.title}» حذف شود؟`);
    if (!confirmed) return;

    const response = await fetch(`/api/lineages/${lineage.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.message ?? "حذف تبارنامه با خطا روبه‌رو شد.");
      return;
    }

    setLineages((current) => current.filter((item) => item.id !== lineage.id));
    setStatus("");
  }

  return (
    <section className="grid gap-5">
      {status ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {status}
        </div>
      ) : null}

      {lineages.length ? (
        <div className="grid gap-4">
          {lineages.map((lineage) => (
            <article
              key={lineage.id}
              className="rounded-[1.5rem] border border-border bg-card p-5 text-card-foreground shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black">{lineage.title}</h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${
                        lineage.isApproved
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                          : "border-zinc-400/30 bg-muted text-muted-foreground"
                      }`}
                    >
                      {lineage.isApproved ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                    <span className="rounded-full border border-shah-gold-500/25 bg-shah-gold-500/10 px-3 py-1 text-xs font-black text-shah-gold-800 dark:text-shah-gold-200">
                      {lineage.characterCount} شخصیت
                    </span>
                  </div>
                  {lineage.description ? (
                    <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-muted-foreground">
                      {lineage.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/lineages/${lineage.id}/edit`}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-black transition hover:border-shah-gold-500 hover:text-shah-gold-700"
                  >
                    ویرایش
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeLineage(lineage)}
                    className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-border bg-card px-6 py-16 text-center">
          <h2 className="text-xl font-black">هنوز تبارنامه‌ای ساخته نشده است</h2>
          <p className="mt-3 text-sm font-bold text-muted-foreground">
            برای نمایش عمومی lineage باید یک تبارنامه بسازید و آن را منتشر کنید.
          </p>
        </div>
      )}
    </section>
  );
}
