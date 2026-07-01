"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  FiBookOpen,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi2";

import { SelectControl } from "@/components/select-control";
import { ArchiveSearchPanel } from "@/components/archive-search-panel";
import { StoryCard } from "@/components/story-card";
import {
  archiveOptions,
  type ArchiveSearchResult,
  type SearchMatch,
  type StoryArchiveQuery,
  type StorySort,
  storyReadingTime,
  toFaNumber,
} from "@/lib/archive-search";
import { formatReadingTimeFa } from "@/lib/reading-time";
import type { Story } from "@/types/story";

type StoriesArchiveProps = {
  characterOptions: Array<{ name: string; slug: string }>;
  result: ArchiveSearchResult<Story>;
  totalCount: number;
};

const sortOptions: Array<{ label: string; value: StorySort }> = [
  { label: "جدیدترین", value: "newest" },
  { label: "محبوب‌ترین", value: "popular" },
  { label: "مدت مطالعه", value: "reading-time" },
];

export function StoriesArchive({
  characterOptions,
  result,
}: StoriesArchiveProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const filters = result.filters as StoryArchiveQuery;
  const [draftSearch, setDraftSearch] = useState(filters.search ?? "");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  const navigate = useCallback(
    (next: StoryArchiveQuery) => {
      startTransition(() =>
        router.replace(buildStoriesUrl(pathname, next), { scroll: false }),
      );
    },
    [pathname, router],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (draftSearch !== (filters.search ?? "")) {
        navigate({
          ...filters,
          cursor: undefined,
          page: 1,
          search: draftSearch.trim(),
        });
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [draftSearch, filters, navigate]);

  const activeFilters = useMemo(
    () => getActiveStoryFilters(filters, characterOptions),
    [characterOptions, filters],
  );
  const related = result.relatedResults.filter((item) => item.label);

  function toggleList(
    key: "era" | "theme" | "length" | "character",
    value: string,
  ) {
    const current = filters[key] ?? [];
    const nextValues = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    navigate({ ...filters, [key]: nextValues, cursor: undefined, page: 1 });
  }

  function removeFilter(key: keyof StoryArchiveQuery, value?: string) {
    if (key === "search") {
      setDraftSearch("");
      navigate({ ...filters, cursor: undefined, page: 1, search: "" });
      return;
    }

    const current = filters[key];
    if (Array.isArray(current)) {
      navigate({
        ...filters,
        [key]: current.filter((item) => item !== value),
        cursor: undefined,
        page: 1,
      });
      return;
    }

    navigate({ ...filters, [key]: undefined, cursor: undefined, page: 1 });
  }

  function resetFilters() {
    setDraftSearch("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!related.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((index) => (index + 1) % related.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion(
        (index) => (index - 1 + related.length) % related.length,
      );
    }
    if (event.key === "Enter" && related[activeSuggestion]) {
      router.push(related[activeSuggestion].href);
    }
  }

  return (
    <section className="relative z-10 space-y-10">
      <ArchiveSearchPanel
        activeFilters={activeFilters}
        filterControls={
          <>
            <FilterMenu
              label="دوره"
              options={archiveOptions.eras}
              selected={filters.era ?? []}
              onToggle={(value) => toggleList("era", value)}
            />
            <FilterMenu
              label="شخصیت"
              options={characterOptions.map((item) => item.slug)}
              selected={filters.character ?? []}
              labels={Object.fromEntries(
                characterOptions.map((item) => [item.slug, item.name]),
              )}
              onToggle={(value) => toggleList("character", value)}
            />
            <FilterMenu
              label="درون‌مایه"
              options={archiveOptions.storyThemes}
              selected={filters.theme ?? []}
              onToggle={(value) => toggleList("theme", value)}
            />
            <FilterMenu
              label="طول"
              options={archiveOptions.storyLengths}
              selected={filters.length ?? []}
              onToggle={(value) => toggleList("length", value)}
            />
            <SortMenu
              value={filters.sort ?? "newest"}
              onChange={(sort) =>
                navigate({ ...filters, cursor: undefined, page: 1, sort })
              }
            />
          </>
        }
        onClearSearch={() => removeFilter("search")}
        onMobileFiltersOpen={() => setIsDrawerOpen(true)}
        onRemoveFilter={(filter) =>
          removeFilter(filter.key as keyof StoryArchiveQuery, filter.value)
        }
        onResetFilters={resetFilters}
        onSearchChange={setDraftSearch}
        onSearchKeyDown={onSearchKeyDown}
        placeholder="جستجو در عنوان، متن روایت، برچسب‌ها و شخصیت‌ها..."
        searchValue={draftSearch}
      />

      {isPending ? <StorySkeletonGrid /> : null}

      {!isPending && result.items.length ? (
        <>
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {result.items.map((story) => (
              <div key={story.id} className="flex h-full animate-fade-up flex-col">
                <StoryCard story={story} />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-shah-gold-500/15 bg-white/60 px-4 py-3 text-xs font-black text-zinc-600 backdrop-blur dark:bg-white/5 dark:text-zinc-300">
                  <span className="flex items-center gap-2">
                    <HiOutlineClock className="size-4 text-shah-gold-500" />
                    {formatReadingTimeFa(storyReadingTime(story))}
                  </span>
                  <span className="flex items-center gap-2">
                    <FiBookOpen className="text-shah-gold-500" />
                    {toFaNumber(story.characters.length)} شخصیت
                  </span>
                </div>
                <MatchExcerpt match={result.matches[story.id]} />
              </div>
            ))}
          </div>
          <ArchivePagination
            currentPage={result.page}
            filters={filters}
            pathname={pathname}
            totalPages={result.totalPages}
          />
        </>
      ) : null}

      {!isPending && !result.items.length ? (
        <EmptyState
          didYouMean={result.didYouMean}
          onSuggestion={() => {
            if (result.didYouMean) setDraftSearch(result.didYouMean);
          }}
        />
      ) : null}

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <DrawerGroup
          label="دوره"
          options={archiveOptions.eras}
          selected={filters.era ?? []}
          onToggle={(value) => toggleList("era", value)}
        />
        <DrawerGroup
          label="شخصیت اصلی"
          options={characterOptions.map((item) => item.slug)}
          selected={filters.character ?? []}
          labels={Object.fromEntries(
            characterOptions.map((item) => [item.slug, item.name]),
          )}
          onToggle={(value) => toggleList("character", value)}
        />
        <DrawerGroup
          label="درون‌مایه"
          options={archiveOptions.storyThemes}
          selected={filters.theme ?? []}
          onToggle={(value) => toggleList("theme", value)}
        />
        <DrawerGroup
          label="طول روایت"
          options={archiveOptions.storyLengths}
          selected={filters.length ?? []}
          onToggle={(value) => toggleList("length", value)}
        />
      </MobileDrawer>
    </section>
  );
}

function FilterMenu({
  label,
  labels,
  onToggle,
  options,
  selected,
}: {
  label: string;
  labels?: Record<string, string>;
  onToggle: (value: string) => void;
  options: string[];
  selected: string[];
}) {
  return (
    <SelectControl
      multiple
      onChange={(value) => {
        const next = value as string[];
        const changed =
          options.find((option) => selected.includes(option) !== next.includes(option)) ??
          "";
        if (changed) onToggle(changed);
      }}
      options={options.map((option) => ({
        label: labels?.[option] ?? option,
        value: option,
      }))}
      placeholder={label}
      value={selected}
    />
  );
}

function SortMenu({
  onChange,
  value,
}: {
  onChange: (value: StorySort) => void;
  value: StorySort;
}) {
  return (
    <SelectControl
      onChange={(next) => onChange(next as StorySort)}
      options={sortOptions}
      placeholder="مرتب‌سازی"
      value={value}
    />
  );
}

function MatchExcerpt({ match }: { match?: SearchMatch }) {
  if (!match?.excerpt) return null;
  return (
    <div className="mt-3 rounded-2xl border border-shah-gold-500/15 bg-white/60 px-4 py-3 text-right text-xs font-semibold leading-6 text-zinc-600 backdrop-blur dark:bg-white/5 dark:text-zinc-300">
      <HighlightedText terms={match.terms} text={match.excerpt} />
    </div>
  );
}

function HighlightedText({ terms, text }: { terms: string[]; text: string }) {
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, index) =>
        terms.some((term) => part.includes(term)) ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-shah-gold-300/40 px-1 text-inherit"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function EmptyState({
  didYouMean,
  onSuggestion,
}: {
  didYouMean?: string;
  onSuggestion: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-4xl border border-shah-gold-500/10 bg-white/45 py-24 text-center backdrop-blur-xl dark:bg-white/5">
      <FiSearch className="mb-6 h-14 w-14 text-shah-gold-500/50" />
      <h2 className="text-xl font-black text-zinc-900 dark:text-white">
        روایتی با این مشخصات پیدا نشد
      </h2>
      <p className="mt-3 max-w-md text-sm font-medium leading-7 text-zinc-500">
        نام شخصیت، مضمون یا بخشی از عنوان را کوتاه‌تر وارد کنید.
      </p>
      {didYouMean ? (
        <button
          type="button"
          onClick={onSuggestion}
          className="mt-6 rounded-full bg-shah-gold-500 px-5 py-3 text-sm font-black text-white"
        >
          جستجوی «{didYouMean}»
        </button>
      ) : null}
    </div>
  );
}

function StorySkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-92 animate-pulse rounded-2xl bg-shah-gold-500/10"
        />
      ))}
    </div>
  );
}

function MobileDrawer({
  children,
  isOpen,
  onClose,
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-90 lg:hidden">
      <button
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="بستن فیلترها"
      />
      <div className="absolute inset-x-0 bottom-0 animate-fade-up rounded-t-4xl border border-white/10 bg-shah-black-950 p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-base font-black">فیلترهای پیشرفته</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <FiX />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-6 overflow-y-auto pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function DrawerGroup({
  label,
  labels,
  onToggle,
  options,
  selected,
}: {
  label: string;
  labels?: Record<string, string>;
  onToggle: (value: string) => void;
  options: string[];
  selected: string[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-black text-shah-gold-300">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                active
                  ? "bg-shah-gold-500 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {labels?.[option] ?? option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ArchivePagination({
  currentPage,
  filters,
  pathname,
  totalPages,
}: {
  currentPage: number;
  filters: StoryArchiveQuery;
  pathname: string;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (page) =>
      page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );

  return (
    <nav
      className="mt-16 flex flex-wrap items-center justify-center gap-2"
      aria-label="صفحه‌بندی"
    >
      {pages.map((page, index) => {
        const previous = pages[index - 1];
        return (
          <div key={page} className="flex items-center gap-2">
            {previous && page - previous > 1 ? (
              <span className="px-1 text-zinc-500">...</span>
            ) : null}
            <Link
              href={buildStoriesUrl(pathname, {
                ...filters,
                cursor: undefined,
                page,
              })}
              className={`flex h-11 min-w-11 items-center justify-center rounded-xl border px-4 text-sm font-black transition ${
                page === currentPage
                  ? "border-shah-gold-500 bg-shah-gold-500 text-white"
                  : "border-border bg-card text-card-foreground hover:border-accent"
              }`}
            >
              {toFaNumber(page)}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

function getActiveStoryFilters(
  filters: StoryArchiveQuery,
  characterOptions: Array<{ name: string; slug: string }>,
) {
  const characterLabels = new Map(
    characterOptions.map((item) => [item.slug, item.name]),
  );
  const chips: Array<{
    key: keyof StoryArchiveQuery;
    label: string;
    value?: string;
  }> = [];
  if (filters.search)
    chips.push({ key: "search", label: `جستجو: ${filters.search}` });
  filters.era?.forEach((value) =>
    chips.push({ key: "era", label: value, value }),
  );
  filters.theme?.forEach((value) =>
    chips.push({ key: "theme", label: value, value }),
  );
  filters.length?.forEach((value) =>
    chips.push({ key: "length", label: value, value }),
  );
  filters.character?.forEach((value) =>
    chips.push({
      key: "character",
      label: characterLabels.get(value) ?? value,
      value,
    }),
  );
  return chips;
}

function buildStoriesUrl(pathname: string, filters: StoryArchiveQuery) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.era?.length) params.set("era", filters.era.join(","));
  if (filters.theme?.length) params.set("theme", filters.theme.join(","));
  if (filters.length?.length) params.set("length", filters.length.join(","));
  if (filters.character?.length)
    params.set("character", filters.character.join(","));
  if (filters.sort && filters.sort !== "newest")
    params.set("sort", filters.sort);
  if (filters.cursor) params.set("cursor", filters.cursor);
  if (filters.page && filters.page > 1)
    params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
