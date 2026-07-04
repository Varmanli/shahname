"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiEdit3,
  FiEye,
  FiFilter,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSelect } from "@/components/admin/admin-form-controls";
import type { SelectOption } from "@/components/select-control";
import type { Character } from "@/types/character";

type CharactersListProps = {
  characters: Character[];
};

type FilterKey =
  | "all"
  | "has-scene"
  | "no-scene"
  | "has-portrait"
  | "no-portrait"
  | "has-lineage"
  | "no-lineage";

type SortKey = "newest" | "oldest" | "name-asc" | "name-desc" | "complete";

const PAGE_SIZE = 9;

const filterOptions: SelectOption[] = [
  { label: "همه شخصیت‌ها", value: "all" },
  { label: "دارای تصویر صحنه", value: "has-scene" },
  { label: "بدون تصویر صحنه", value: "no-scene" },
  { label: "دارای پرتره", value: "has-portrait" },
  { label: "بدون پرتره", value: "no-portrait" },
  { label: "دارای تبارنامه", value: "has-lineage" },
  { label: "بدون تبارنامه", value: "no-lineage" },
];

const sortOptions: SelectOption[] = [
  { label: "جدیدترین", value: "newest" },
  { label: "قدیمی‌ترین", value: "oldest" },
  { label: "نام، الف تا ی", value: "name-asc" },
  { label: "نام، ی تا الف", value: "name-desc" },
  { label: "کامل‌ترین پروفایل", value: "complete" },
];

function richTextToPlainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasLineageRelations(character: Character) {
  return Boolean(
    character.fatherId ||
    character.motherId ||
    character.spouseIds.length ||
    character.childrenIds.length ||
    character.siblingIds.length ||
    character.relations.length,
  );
}

function getCompletenessScore(character: Character) {
  const checks = [
    Boolean(character.sceneImage),
    Boolean(character.portraitImage),
    Boolean(character.shortDescription.trim()),
    Boolean(character.role || character.title),
    hasLineageRelations(character),
  ];

  return checks.filter(Boolean).length;
}

function matchesFilter(character: Character, filter: FilterKey) {
  switch (filter) {
    case "has-scene":
      return Boolean(character.sceneImage);
    case "no-scene":
      return !character.sceneImage;
    case "has-portrait":
      return Boolean(character.portraitImage);
    case "no-portrait":
      return !character.portraitImage;
    case "has-lineage":
      return hasLineageRelations(character);
    case "no-lineage":
      return !hasLineageRelations(character);
    default:
      return true;
  }
}

function sortCharacters(characters: Character[], sort: SortKey) {
  const sorted = [...characters];

  switch (sort) {
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "fa"));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "fa"));
    case "complete":
      return sorted.sort((a, b) => {
        const scoreDiff = getCompletenessScore(b) - getCompletenessScore(a);
        return scoreDiff !== 0 ? scoreDiff : a.name.localeCompare(b.name, "fa");
      });
    case "newest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export function CharactersList({
  characters: initialCharacters,
}: CharactersListProps) {
  const [characters, setCharacters] = useState(initialCharacters);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ query: "", filter: "all" as FilterKey, sort: "newest" as SortKey });

  const normalizedQuery = query.trim().toLowerCase();

  // بازنشانی صفحه به ۱ هنگام تغییر جستجو/فیلتر/ترتیب — طبق الگوی رسمی ری‌اکت
  // برای «تنظیم state هنگام تغییر props/state دیگر»، مستقیم داخل رندر انجام
  // می‌شود، نه useEffect (که باعث یک رندر اضافه و chained می‌شد).
  if (
    appliedFilters.query !== normalizedQuery ||
    appliedFilters.filter !== filter ||
    appliedFilters.sort !== sort
  ) {
    setAppliedFilters({ query: normalizedQuery, filter, sort });
    setPage(1);
  }

  const filteredCharacters = useMemo(() => {
    const searched = normalizedQuery
      ? characters.filter((character) =>
          `${character.name} ${character.title} ${character.role} ${character.nationality} ${character.nameMeaning} ${character.dynasty}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : characters;

    const filtered = searched.filter((character) => matchesFilter(character, filter));

    return sortCharacters(filtered, sort);
  }, [characters, normalizedQuery, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredCharacters.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageCharacters = filteredCharacters.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const isFiltering = normalizedQuery !== "" || filter !== "all";

  async function handleDelete(character: Character) {
    const confirmed = window.confirm(`شخصیت «${character.name}» حذف شود؟`);
    if (!confirmed) return;

    const response = await fetch(`/api/characters/${character.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.message ?? "حذف شخصیت با خطا روبه‌رو شد.");
      return;
    }

    setCharacters((current) =>
      current.filter((item) => item.id !== character.id),
    );
    setStatus("");
  }

  return (
    <section className="grid gap-6">
      <div className="relative rounded-4xl border border-shah-gold-500/16 bg-white/78 p-5 shadow-xl shadow-shah-black-900/6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5.5 md:p-6">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-4xl">
          <div className="absolute -left-16 -top-16 size-48 rounded-full bg-shah-gold-500/12 blur-3xl" />
          <div className="absolute -bottom-20 right-16 size-56 rounded-full bg-shah-lapis-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto] xl:grid-cols-[minmax(0,26rem)_auto_auto]">
            <div className="relative">
              <FiSearch
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/70"
              />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو بر اساس نام، لقب، نقش، ملیت، معنی نام یا دودمان..."
                className="h-12 w-full rounded-2xl border border-shah-gold-500/12 bg-white/70 pr-12 pl-4 text-sm font-bold text-foreground outline-none backdrop-blur-xl transition placeholder:text-muted-foreground/60 focus:border-shah-gold-500/35 focus:bg-white focus:ring-4 focus:ring-shah-gold-500/8 dark:border-white/10 dark:bg-white/4.5 dark:focus:bg-white/7.5"
              />
            </div>

            <AdminSelect
              className="min-w-40"
              icon={<FiFilter aria-hidden className="size-4" />}
              onChange={(value) => setFilter(value as FilterKey)}
              options={filterOptions}
              placeholder="فیلتر شخصیت‌ها"
              value={filter}
              variant="toolbar"
            />

            <AdminSelect
              className="min-w-40"
              onChange={(value) => setSort(value as SortKey)}
              options={sortOptions}
              placeholder="ترتیب نمایش"
              value={sort}
              variant="toolbar"
            />
          </div>

          <div className="flex h-12 shrink-0 items-center justify-center rounded-2xl border border-shah-gold-500/12 bg-white/70 px-5 text-sm font-black text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5">
            {toFaNumber(filteredCharacters.length)} شخصیت
          </div>
        </div>
      </div>

      {status ? (
        <div className="rounded-[1.4rem] border border-red-500/18 bg-red-50/90 px-5 py-4 text-sm font-black leading-7 text-red-700 shadow-lg shadow-red-950/5 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-200">
          {status}
        </div>
      ) : null}

      {filteredCharacters.length === 0 ? (
        <div className="relative overflow-hidden rounded-4xl border border-dashed border-shah-gold-500/24 bg-white/70 px-8 py-20 text-center shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-shah-gold-500/10 text-shah-gold-800 dark:text-shah-gold-200">
            <FiSearch aria-hidden className="size-7" />
          </div>

          <h2 className="mt-5 text-2xl font-black text-foreground">
            شخصیتی پیدا نشد
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-7 text-muted-foreground">
            {isFiltering
              ? "نتیجه‌ای برای جستجو یا فیلتر فعلی وجود ندارد. عبارت جستجو را تغییر دهید یا فیلترها را پاک کنید."
              : "هنوز شخصیتی ثبت نشده است. از منوی ایجاد شخصیت جدید، اولین شخصیت را ثبت کنید."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pageCharacters.map((character) => (
              <CharacterCard
                character={character}
                key={character.id}
                onDelete={() => handleDelete(character)}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <AdminPagination
              onPageChange={setPage}
              page={currentPage}
              pageSize={PAGE_SIZE}
              totalItems={filteredCharacters.length}
            />
          ) : null}
        </>
      )}
    </section>
  );
}

function CharacterCard({
  character,
  onDelete,
}: {
  character: Character;
  onDelete: () => void;
}) {
  const hasRelations = hasLineageRelations(character);
  const bannerImage = character.sceneImage;
  const portraitImage = character.portraitImage;
  const subtitle = character.role || character.title;
  const meta = [character.nationality, character.nameMeaning].filter(Boolean);

  return (
    <article className="group relative overflow-hidden rounded-4xl border border-shah-gold-500/14 bg-white/78 text-card-foreground shadow-xl shadow-shah-black-900/6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-shah-gold-500/35 hover:bg-white/92 hover:shadow-2xl dark:border-white/10 dark:bg-white/5.5 dark:hover:bg-white/8">
      <div className="relative aspect-video w-full overflow-hidden bg-shah-lapis-950">
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt={`بنر ${character.name}`}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
            unoptimized={bannerImage.startsWith("/uploads/")}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-shah-lapis-950 via-shah-lapis-800 to-shah-gold-700" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-shah-black-950/80 via-shah-black-950/12 to-transparent" />

        <div className="absolute right-4 top-4">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black shadow-lg backdrop-blur-xl ${
              hasRelations
                ? "border-shah-gold-300/25 bg-shah-gold-500/18 text-shah-gold-100"
                : "border-white/14 bg-black/24 text-white/72"
            }`}
          >
            {hasRelations ? "دارای تبارنامه" : "بدون تبارنامه"}
          </span>
        </div>
      </div>

      <div className="relative px-5 pb-5">
        <div className="relative -mt-14 flex items-end justify-between gap-4">
          <div className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-[1.45rem] border-4 border-white bg-shah-lapis-900 text-3xl font-black text-shah-gold-200 shadow-2xl shadow-shah-lapis-950/20 dark:border-[#15151f]">
            {portraitImage ? (
              <Image
                src={portraitImage}
                alt={character.name}
                fill
                sizes="112px"
                className="object-cover transition duration-500 group-hover:scale-110"
                unoptimized={portraitImage.startsWith("/uploads/")}
              />
            ) : (
              character.name.slice(0, 1)
            )}
          </div>

          <Link
            href={`/characters/${encodeURIComponent(character.slug)}`}
            className="mb-2 inline-flex size-11 items-center justify-center rounded-2xl border border-shah-gold-500/16 bg-white/76 text-shah-gold-800 shadow-lg shadow-shah-black-900/5 transition hover:-translate-y-0.5 hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-white/8 dark:text-shah-gold-100"
            title="نمایش"
          >
            <FiArrowLeft aria-hidden className="size-5" />
          </Link>
        </div>

        <div className="mt-5">
          <h2 className="line-clamp-1 text-2xl font-black tracking-tight text-foreground">
            {character.name}
          </h2>

          {subtitle ? (
            <p className="mt-1 line-clamp-1 text-sm font-black text-shah-gold-800 dark:text-shah-gold-200">
              {subtitle}
            </p>
          ) : null}

          {meta.length ? (
            <p className="mt-2 line-clamp-1 text-xs font-bold leading-6 text-muted-foreground">
              {meta.join("، ")}
            </p>
          ) : null}

          {character.shortDescription ? (
            <p className="mt-4 line-clamp-2 min-h-14 text-sm font-medium leading-7 text-muted-foreground">
              {richTextToPlainText(character.shortDescription)}
            </p>
          ) : (
            <p className="mt-4 line-clamp-2 min-h-14 text-sm font-medium italic leading-7 text-muted-foreground/70">
              توضیح کوتاهی برای این شخصیت ثبت نشده است.
            </p>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-shah-gold-500/10 pt-4 dark:border-white/8">
          <Link
            href={`/characters/${encodeURIComponent(character.slug)}`}
            className="group/action inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-shah-gold-500/14 bg-white/65 text-xs font-black text-foreground transition hover:-translate-y-0.5 hover:border-shah-gold-500/35 hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-white/5.5"
          >
            <FiEye aria-hidden className="size-4" />
            نمایش
          </Link>

          <Link
            href={`/admin/characters/${character.id}/edit`}
            className="group/action inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-shah-lapis-500/14 bg-shah-lapis-500/8 text-xs font-black text-shah-lapis-900 transition hover:-translate-y-0.5 hover:bg-shah-lapis-900 hover:text-shah-gold-100 dark:border-white/10 dark:text-blue-100"
          >
            <FiEdit3 aria-hidden className="size-4" />
            ویرایش
          </Link>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-500/16 bg-red-500/8 text-xs font-black text-red-700 transition hover:-translate-y-0.5 hover:bg-red-500 hover:text-white dark:border-red-400/16 dark:text-red-200"
          >
            <FiTrash2 aria-hidden className="size-4" />
            حذف
          </button>
        </div>
      </div>
    </article>
  );
}
