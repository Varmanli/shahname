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
import { FiFilter, FiSearch, FiX } from "react-icons/fi";

import { ArchiveSearchPanel } from "@/components/archive-search-panel";
import { CharacterCard } from "@/components/character-card";
import { PageHeroHeader } from "@/components/page-hero-header";
import { SelectControl } from "@/components/select-control";
import {
  archiveOptions,
  type ArchiveSearchResult,
  type CharacterArchiveQuery,
  type CharacterSort,
  type SearchMatch,
  toFaNumber,
} from "@/lib/archive-search";
import type { Character } from "@/types/character";

type CharactersArchiveProps = {
  filterOptions: {
    dynasties: string[];
    nationalities: string[];
  };
  result: ArchiveSearchResult<Character>;
  totalCount: number;
};

const sortOptions: Array<{ label: string; value: CharacterSort }> = [
  { label: "مهم‌ترین‌ها", value: "featured" },
  { label: "جدیدترین", value: "newest" },
  { label: "الفبایی", value: "alphabetic" },
];

export function CharactersArchive({
  filterOptions,
  result,
}: CharactersArchiveProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const filters = result.filters as CharacterArchiveQuery;
  const [draftSearch, setDraftSearch] = useState(filters.search ?? "");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  const navigate = useCallback(
    (next: CharacterArchiveQuery) => {
      const url = buildCharactersUrl(pathname, next);
      startTransition(() => router.replace(url, { scroll: false }));
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
    () => getActiveCharacterFilters(filters),
    [filters],
  );
  const related = result.relatedResults.filter((item) => item.label);

  function toggleList(
    key: "dynasty" | "era" | "nationality" | "role",
    value: string,
  ) {
    const current = filters[key] ?? [];
    const nextValues = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    navigate({ ...filters, [key]: nextValues, cursor: undefined, page: 1 });
  }

  function removeFilter(key: keyof CharacterArchiveQuery, value?: string) {
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
    <section className="relative mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 md:py-36">
      <PageHeroHeader
        className="mb-16 md:mb-20"
        description="جستجو و کاوش در شخصیت‌ها بر پایه نقش، دوره، پیوندهای خانوادگی و متن روایت‌ها."
        eyebrow="The Great Persian Epic"
        highlight="شاهنامه"
        title="ناموران"
      />

      <div className="mb-10">
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
                label="نقش"
                options={archiveOptions.characterRoles}
                selected={filters.role ?? []}
                onToggle={(value) => toggleList("role", value)}
              />
              <FilterMenu
                label="خاندان"
                options={filterOptions.dynasties}
                selected={filters.dynasty ?? []}
                onToggle={(value) => toggleList("dynasty", value)}
              />
              <FilterMenu
                label="ملیت"
                options={filterOptions.nationalities}
                selected={filters.nationality ?? []}
                onToggle={(value) => toggleList("nationality", value)}
              />
              <SortMenu
                value={filters.sort ?? "featured"}
                onChange={(sort) =>
                  navigate({ ...filters, cursor: undefined, page: 1, sort })
                }
              />
            </>
          }
          onClearSearch={() => removeFilter("search")}
          onMobileFiltersOpen={() => setIsDrawerOpen(true)}
          onRemoveFilter={(filter) =>
            removeFilter(
              filter.key as keyof CharacterArchiveQuery,
              filter.value,
            )
          }
          onResetFilters={resetFilters}
          onSearchChange={setDraftSearch}
          onSearchKeyDown={onSearchKeyDown}
          placeholder="جستجو در نام، لقب، توضیحات و روایت شخصیت‌ها..."
          searchValue={draftSearch}
        />
      </div>

      {isPending ? <CharacterSkeletonGrid /> : null}

      {!isPending && result.items.length ? (
        <>
          <div className="relative z-0 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-10">
            {result.items.map((character) => (
              <div key={character.id} className="animate-fade-up">
                <CharacterCard character={character} />
                <MatchExcerpt match={result.matches[character.id]} />
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
          label="نقش"
          options={archiveOptions.characterRoles}
          selected={filters.role ?? []}
          onToggle={(value) => toggleList("role", value)}
        />
        <DrawerGroup
          label="خاندان"
          options={filterOptions.dynasties}
          selected={filters.dynasty ?? []}
          onToggle={(value) => toggleList("dynasty", value)}
        />
        <DrawerGroup
          label="ملیت"
          options={filterOptions.nationalities}
          selected={filters.nationality ?? []}
          onToggle={(value) => toggleList("nationality", value)}
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
      icon={<FiFilter className="shrink-0 text-shah-gold-500" />}
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
  onChange: (value: CharacterSort) => void;
  value: CharacterSort;
}) {
  return (
    <SelectControl
      onChange={(next) => onChange(next as CharacterSort)}
      options={sortOptions}
      placeholder="مرتب‌سازی"
      value={value}
    />
  );
}

function MatchExcerpt({ match }: { match?: SearchMatch }) {
  if (!match?.excerpt) return null;
  return (
    <div className="mx-auto mt-3 max-w-72 rounded-2xl border border-shah-gold-500/15 bg-white/60 px-4 py-3 text-center text-xs font-semibold leading-6 text-zinc-600 backdrop-blur dark:bg-white/5 dark:text-zinc-300">
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
        شخصیتی با این فیلترها پیدا نشد
      </h2>
      <p className="mt-3 max-w-md text-sm font-medium leading-7 text-zinc-500">
        بخشی از نام، لقب یا دوره را کوتاه‌تر وارد کنید یا چند فیلتر را حذف کنید.
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

function CharacterSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-10">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="mx-auto h-96 w-72 animate-pulse rounded-[3rem] bg-shah-gold-500/10"
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
      <div className="absolute inset-x-0 bottom-0 animate-fade-up rounded-t-4xl border border-border bg-card p-5 text-card-foreground shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-base font-black">فیلترهای پیشرفته</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10"
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
      <h3 className="mb-3 text-sm font-black text-accent">{label}</h3>
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
                  : "bg-foreground/10 text-card-foreground"
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
  filters: CharacterArchiveQuery;
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
              href={buildCharactersUrl(pathname, {
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

function getActiveCharacterFilters(filters: CharacterArchiveQuery) {
  const chips: Array<{
    key: keyof CharacterArchiveQuery;
    label: string;
    value?: string;
  }> = [];
  if (filters.search)
    chips.push({ key: "search", label: `جستجو: ${filters.search}` });
  filters.era?.forEach((value) =>
    chips.push({ key: "era", label: value, value }),
  );
  filters.role?.forEach((value) =>
    chips.push({ key: "role", label: value, value }),
  );
  filters.dynasty?.forEach((value) =>
    chips.push({ key: "dynasty", label: `خاندان: ${value}`, value }),
  );
  filters.nationality?.forEach((value) =>
    chips.push({ key: "nationality", label: `ملیت: ${value}`, value }),
  );
  return chips;
}

function buildCharactersUrl(pathname: string, filters: CharacterArchiveQuery) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.era?.length) params.set("era", filters.era.join(","));
  if (filters.role?.length) params.set("role", filters.role.join(","));
  if (filters.dynasty?.length) params.set("dynasty", filters.dynasty.join(","));
  if (filters.nationality?.length)
    params.set("nationality", filters.nationality.join(","));
  if (filters.sort && filters.sort !== "featured")
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
