"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEdit3,
  FiGitBranch,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

import type { Lineage } from "@/types/lineage";

type LineageWithCount = Lineage & {
  characterCount: number;
};

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

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
        <div className="rounded-[1.35rem] border border-red-500/18 bg-red-50/90 px-4 py-3 text-sm font-black leading-7 text-red-700 shadow-lg shadow-red-950/5 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
          {status}
        </div>
      ) : null}

      {lineages.length ? (
        <div className="grid gap-3">
          {lineages.map((lineage) => (
            <LineageCard
              key={lineage.id}
              lineage={lineage}
              onDelete={() => removeLineage(lineage)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  );
}

function LineageCard({
  lineage,
  onDelete,
}: {
  lineage: LineageWithCount;
  onDelete: () => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[1.6rem] border border-shah-gold-500/12 bg-white/72 p-4 text-card-foreground shadow-lg shadow-shah-black-900/5 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-shah-gold-500/28 hover:bg-white/88 hover:shadow-xl dark:border-white/10 dark:bg-white/4.5 dark:hover:bg-white/[0.07] md:p-5">
      <div className="pointer-events-none absolute -left-20 -top-20 size-52 rounded-full bg-shah-gold-500/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-12 size-56 rounded-full bg-shah-lapis-500/8 blur-3xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-shah-gold-500/14 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/15 dark:text-shah-gold-200">
            <FiGitBranch aria-hidden className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-black text-foreground md:text-xl">
                {lineage.title}
              </h2>

              <StatusBadge approved={lineage.isApproved} />

              <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-shah-gold-500/16 bg-shah-gold-500/8 px-3 text-xs font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
                <FiUsers aria-hidden className="size-3.5" />
                {toFaNumber(lineage.characterCount)} شخصیت
              </span>
            </div>

            {lineage.description ? (
              <p className="mt-2 line-clamp-2 max-w-4xl text-sm font-bold leading-7 text-muted-foreground">
                {lineage.description}
              </p>
            ) : (
              <p className="mt-2 text-sm font-bold leading-7 text-muted-foreground/70">
                توضیحی برای این تبارنامه ثبت نشده است.
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2 lg:justify-end">
          <Link
            href={`/admin/lineages/${lineage.id}/edit`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-shah-gold-500/14 bg-white/58 px-4 text-xs font-black text-foreground transition hover:-translate-y-0.5 hover:border-shah-gold-500/35 hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-white/5.5 dark:hover:bg-shah-gold-500 dark:hover:text-shah-black-950 sm:flex-none"
          >
            <FiEdit3 aria-hidden className="size-4" />
            ویرایش
          </Link>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/16 bg-red-500/8 px-4 text-xs font-black text-red-700 transition hover:-translate-y-0.5 hover:bg-red-500 hover:text-white dark:border-red-400/16 dark:text-red-200 sm:flex-none"
          >
            <FiTrash2 aria-hidden className="size-4" />
            حذف
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ approved }: { approved: boolean }) {
  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-black ${
        approved
          ? "border-emerald-500/18 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/18 dark:text-emerald-200"
          : "border-zinc-400/18 bg-muted/70 text-muted-foreground dark:border-white/10 dark:bg-white/4.5"
      }`}
    >
      {approved ? (
        <FiCheckCircle aria-hidden className="size-3.5" />
      ) : (
        <span className="size-1.5 rounded-full bg-current opacity-60" />
      )}

      {approved ? "منتشر شده" : "پیش‌نویس"}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-dashed border-shah-gold-500/22 bg-white/70 px-6 py-16 text-center shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5">
      <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-shah-gold-500/10 blur-3xl" />

      <div className="relative mx-auto grid size-16 place-items-center rounded-3xl border border-shah-gold-500/14 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/15 dark:text-shah-gold-200">
        <FiGitBranch aria-hidden className="size-7" />
      </div>

      <h2 className="relative mt-5 text-xl font-black text-foreground">
        هنوز تبارنامه‌ای ساخته نشده است
      </h2>

      <p className="relative mx-auto mt-3 max-w-md text-sm font-bold leading-7 text-muted-foreground">
        برای نمایش عمومی lineage باید یک تبارنامه بسازید و بعد از تکمیل، آن را
        منتشر کنید.
      </p>

      <Link
        href="/admin/lineages/new"
        className="relative mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-shah-lapis-900 px-5 text-xs font-black text-shah-gold-100 shadow-lg shadow-shah-lapis-900/15 transition hover:-translate-y-0.5 hover:bg-shah-lapis-800 hover:text-white dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
      >
        ایجاد تبارنامه
        <FiArrowLeft aria-hidden className="size-4" />
      </Link>
    </div>
  );
}
