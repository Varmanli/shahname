"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FiBookOpen,
  FiEdit3,
  FiEye,
  FiFileText,
  FiImage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSelect } from "@/components/admin/admin-form-controls";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import type { Story } from "@/types/story";

type StoriesListProps = {
  stories: Story[];
};

type StoryFilter =
  | "all"
  | "has-cover"
  | "no-cover"
  | "has-sections"
  | "no-sections"
  | "has-characters"
  | "no-characters"
  | "has-quote"
  | "no-quote";

type StorySort =
  | "order-asc"
  | "order-desc"
  | "title-asc"
  | "sections-desc"
  | "characters-desc";

const PAGE_SIZE = 9;

const filterOptions: Array<{ label: string; value: StoryFilter }> = [
  { label: "همه روایت‌ها", value: "all" },
  { label: "دارای کاور", value: "has-cover" },
  { label: "بدون کاور", value: "no-cover" },
  { label: "دارای بخش", value: "has-sections" },
  { label: "بدون بخش", value: "no-sections" },
  { label: "دارای شخصیت", value: "has-characters" },
  { label: "بدون شخصیت", value: "no-characters" },
  { label: "دارای بیت", value: "has-quote" },
  { label: "بدون بیت", value: "no-quote" },
];

const sortOptions: Array<{ label: string; value: StorySort }> = [
  { label: "ترتیب زمانی، صعودی", value: "order-asc" },
  { label: "ترتیب زمانی، نزولی", value: "order-desc" },
  { label: "عنوان الفبایی", value: "title-asc" },
  { label: "بیشترین بخش", value: "sections-desc" },
  { label: "بیشترین شخصیت", value: "characters-desc" },
];

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function stripHtml(value?: string) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function hasText(value?: string) {
  return stripHtml(value).length > 0;
}

export function StoriesList({ stories: initialStories }: StoriesListProps) {
  const [stories, setStories] = useState(initialStories);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StoryFilter>("all");
  const [sort, setSort] = useState<StorySort>("order-asc");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const filteredStories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return stories.filter((story) => {
      const searchableText = [
        story.title,
        story.subtitle,
        story.shortDescription,
        story.slug,
        stripHtml(story.quote),
        ...story.characters.map((character) => character.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      const matchesFilter =
        filter === "all" ||
        (filter === "has-cover" && Boolean(story.coverImage)) ||
        (filter === "no-cover" && !story.coverImage) ||
        (filter === "has-sections" && story.sections.length > 0) ||
        (filter === "no-sections" && story.sections.length === 0) ||
        (filter === "has-characters" && story.characters.length > 0) ||
        (filter === "no-characters" && story.characters.length === 0) ||
        (filter === "has-quote" && hasText(story.quote)) ||
        (filter === "no-quote" && !hasText(story.quote));

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, stories]);

  const sortedStories = useMemo(() => {
    return [...filteredStories].sort((a, b) => {
      if (sort === "order-asc")
        return Number(a.order ?? 0) - Number(b.order ?? 0);
      if (sort === "order-desc")
        return Number(b.order ?? 0) - Number(a.order ?? 0);

      if (sort === "title-asc") {
        return a.title.localeCompare(b.title, "fa");
      }

      if (sort === "sections-desc") {
        return b.sections.length - a.sections.length;
      }

      if (sort === "characters-desc") {
        return b.characters.length - a.characters.length;
      }

      return 0;
    });
  }, [filteredStories, sort]);

  const paginatedStories = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedStories.slice(start, start + PAGE_SIZE);
  }, [page, sortedStories]);

  const hasActiveFilters =
    query.trim() || filter !== "all" || sort !== "order-asc";

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateFilter(value: string) {
    setFilter(value as StoryFilter);
    setPage(1);
  }

  function updateSort(value: string) {
    setSort(value as StorySort);
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setFilter("all");
    setSort("order-asc");
    setPage(1);
  }

  async function handleDelete(story: Story) {
    const confirmed = window.confirm(`داستان «${story.title}» حذف شود؟`);
    if (!confirmed) return;

    const response = await fetch(`/api/stories/${story.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.message ?? "حذف داستان با خطا روبه‌رو شد.");
      return;
    }

    setStories((current) => current.filter((item) => item.id !== story.id));
    setStatus("");
  }

  return (
    <section className="grid gap-5">
      <StoriesToolbar
        count={sortedStories.length}
        filter={filter}
        hasActiveFilters={Boolean(hasActiveFilters)}
        query={query}
        sort={sort}
        totalCount={stories.length}
        onFilterChange={updateFilter}
        onQueryChange={updateQuery}
        onReset={resetFilters}
        onSortChange={updateSort}
      />

      {status ? <StatusMessage message={status} /> : null}

      {paginatedStories.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedStories.map((story) => (
              <StoryAdminCard
                key={story.id}
                story={story}
                onDelete={() => handleDelete(story)}
              />
            ))}
          </div>

          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={sortedStories.length}
            onPageChange={setPage}
          />
        </>
      ) : (
        <StoriesEmptyState
          hasActiveFilters={Boolean(hasActiveFilters)}
          onReset={resetFilters}
        />
      )}
    </section>
  );
}

function StoriesToolbar({
  count,
  filter,
  hasActiveFilters,
  onFilterChange,
  onQueryChange,
  onReset,
  onSortChange,
  query,
  sort,
  totalCount,
}: {
  count: number;
  filter: StoryFilter;
  hasActiveFilters: boolean;
  query: string;
  sort: StorySort;
  totalCount: number;
  onFilterChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  onSortChange: (value: string) => void;
}) {
  return (
    <div className="relative overflow-visible rounded-[1.7rem] border border-shah-gold-500/12 bg-white/72 p-4 shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 md:p-5">
      <div className="pointer-events-none absolute -left-20 -top-24 size-56 rounded-full bg-shah-gold-500/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-12 size-64 rounded-full bg-shah-lapis-500/8 blur-3xl" />

      <div className="relative grid gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-shah-gold-500/14 bg-shah-gold-500/8 px-3 py-1.5 text-[11px] font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100">
              <FiBookOpen aria-hidden className="size-3.5" />
              مدیریت روایت‌ها
            </div>

            <p className="mt-2 text-xs font-bold leading-6 text-muted-foreground">
              {toFaNumber(count)} نتیجه از {toFaNumber(totalCount)} داستان
            </p>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-xl border border-shah-gold-500/14 bg-white/60 px-3 text-xs font-black text-foreground transition hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-white/5.5"
            >
              <FiX aria-hidden className="size-3.5" />
              پاک کردن فیلترها
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_13rem_13rem] lg:items-center">
          <div className="relative">
            <FiSearch
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/70"
            />

            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="جستجو بر اساس عنوان، خلاصه، شخصیت‌ها یا بیت..."
              className="h-12 w-full rounded-2xl border border-shah-gold-500/12 bg-white/70 pr-12 pl-4 text-sm font-bold text-foreground outline-none backdrop-blur-xl transition placeholder:text-muted-foreground/60 focus:border-shah-gold-500/35 focus:bg-white focus:ring-4 focus:ring-shah-gold-500/8 dark:border-white/10 dark:bg-white/4.5 dark:focus:bg-white/7.5"
            />
          </div>

          <AdminSelect
            value={filter}
            onChange={onFilterChange}
            placeholder="فیلتر"
            options={filterOptions}
          />

          <AdminSelect
            value={sort}
            onChange={onSortChange}
            placeholder="مرتب‌سازی"
            options={sortOptions}
          />
        </div>
      </div>
    </div>
  );
}

function StoryAdminCard({
  onDelete,
  story,
}: {
  story: Story;
  onDelete: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[1.65rem] border border-shah-gold-500/12 bg-white/72 text-card-foreground shadow-xl shadow-shah-black-900/5 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-shah-gold-500/28 hover:bg-white/88 hover:shadow-2xl dark:border-white/10 dark:bg-white/4.5 dark:hover:bg-white/[0.07]">
      <StoryCover story={story} />

      <div className="grid gap-4 p-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <MetaBadge
              icon={<FiBookOpen />}
              label={`رتبه ${toFaNumber(story.order ?? 0)}`}
            />
            {hasText(story.quote) ? <MetaBadge label="بیت دارد" /> : null}
          </div>

          <h2 className="line-clamp-1 text-lg font-black text-foreground">
            {story.title}
          </h2>

          {story.subtitle ? (
            <p className="mt-1 line-clamp-1 text-xs font-black text-shah-gold-800 dark:text-shah-gold-200">
              {story.subtitle}
            </p>
          ) : null}

          <p className="mt-2 line-clamp-2 min-h-12 text-xs font-bold leading-6 text-muted-foreground">
            {story.shortDescription || "خلاصه‌ای برای این داستان ثبت نشده است."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StoryStat
            icon={<FiFileText />}
            label="بخش"
            value={story.sections.length}
          />
          <StoryStat
            icon={<FiUsers />}
            label="شخصیت"
            value={story.characters.length}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-shah-gold-500/10 pt-3 dark:border-white/8">
          <Link
            href={`/stories/${encodeURIComponent(story.slug)}`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-shah-gold-500/12 bg-white/58 text-xs font-black text-foreground transition hover:border-shah-gold-500/35 hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-white/4.5"
          >
            <FiEye aria-hidden className="size-3.5" />
            نمایش
          </Link>

          <Link
            href={`/admin/stories/${story.id}/edit`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-shah-gold-500/12 bg-white/58 text-xs font-black text-foreground transition hover:border-shah-gold-500/35 hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-white/4.5"
          >
            <FiEdit3 aria-hidden className="size-3.5" />
            ویرایش
          </Link>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-500/16 bg-red-500/8 text-xs font-black text-red-700 transition hover:bg-red-500 hover:text-white dark:border-red-400/16 dark:text-red-200"
          >
            <FiTrash2 aria-hidden className="size-3.5" />
            حذف
          </button>
        </div>
      </div>
    </article>
  );
}

function StoryCover({ story }: { story: Story }) {
  return (
    <div className="relative aspect-16/8.5 overflow-hidden bg-shah-lapis-950">
      {story.coverImage ? (
        <Image
          src={story.coverImage}
          alt={story.title}
          fill
          sizes="(min-width: 1280px) 28vw, (min-width: 768px) 45vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized={shouldUseUnoptimizedImage(story.coverImage)}
        />
      ) : (
        <div className="grid h-full place-items-center bg-linear-to-br from-shah-lapis-950 via-shah-lapis-900 to-shah-black-950 text-shah-gold-200">
          <div className="grid place-items-center gap-2">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/8">
              <FiImage aria-hidden className="size-5" />
            </div>
            <span className="text-xs font-black text-white/55">بدون کاور</span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-shah-black-950/55 via-transparent to-transparent opacity-80" />

      <div className="absolute bottom-3 right-3 rounded-full border border-white/14 bg-black/32 px-3 py-1 text-[11px] font-black text-white backdrop-blur-xl">
        /stories/{story.slug}
      </div>
    </div>
  );
}

function StoryStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-shah-gold-500/10 bg-shah-gold-500/6 px-3 py-2 dark:border-white/8 dark:bg-white/[0.035]">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-shah-gold-500/10 text-shah-gold-800 dark:text-shah-gold-200">
        {icon}
      </span>

      <span>
        <span className="block text-[11px] font-bold text-muted-foreground">
          {label}
        </span>
        <span className="block text-sm font-black text-foreground">
          {toFaNumber(value)}
        </span>
      </span>
    </div>
  );
}

function MetaBadge({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-shah-gold-500/14 bg-shah-gold-500/8 px-2.5 text-[10px] font-black text-shah-gold-800 dark:border-shah-gold-300/12 dark:text-shah-gold-100 [&>svg]:size-3.5">
      {icon}
      {label}
    </span>
  );
}

function StatusMessage({ message }: { message: string }) {
  return (
    <div className="rounded-[1.35rem] border border-red-500/18 bg-red-50/90 px-4 py-3 text-sm font-black leading-7 text-red-700 shadow-lg shadow-red-950/5 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
      {message}
    </div>
  );
}

function StoriesEmptyState({
  hasActiveFilters,
  onReset,
}: {
  hasActiveFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-dashed border-shah-gold-500/22 bg-white/70 px-6 py-16 text-center shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5">
      <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-shah-gold-500/10 blur-3xl" />

      <div className="relative mx-auto grid size-16 place-items-center rounded-3xl border border-shah-gold-500/14 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/15 dark:text-shah-gold-200">
        <FiBookOpen aria-hidden className="size-7" />
      </div>

      <h2 className="relative mt-5 text-xl font-black text-foreground">
        {hasActiveFilters
          ? "داستانی با این فیلترها پیدا نشد"
          : "هنوز داستانی ثبت نشده است"}
      </h2>

      <p className="relative mx-auto mt-3 max-w-md text-sm font-bold leading-7 text-muted-foreground">
        {hasActiveFilters
          ? "عبارت جستجو یا فیلترهای فعال را تغییر دهید تا نتیجه‌های بیشتری نمایش داده شود."
          : "برای شروع، اولین روایت شاهنامه را از بخش ایجاد داستان جدید ثبت کنید."}
      </p>

      <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-shah-gold-500/14 bg-white/60 px-5 text-xs font-black text-foreground transition hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-white/4.5"
          >
            <FiX aria-hidden className="size-4" />
            پاک کردن فیلترها
          </button>
        ) : null}

        <Link
          href="/admin/stories/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-shah-lapis-900 px-5 text-xs font-black text-shah-gold-100 shadow-lg shadow-shah-lapis-900/15 transition hover:-translate-y-0.5 hover:bg-shah-lapis-800 hover:text-white dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
        >
          <FiPlus aria-hidden className="size-4" />
          ایجاد داستان
        </Link>
      </div>
    </div>
  );
}
