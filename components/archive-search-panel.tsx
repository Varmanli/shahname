"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { FiFilter, FiRefreshCcw, FiSearch, FiX } from "react-icons/fi";

type ActiveFilterChip = {
  key: string;
  label: string;
  value?: string;
};

type ArchiveSearchPanelProps = {
  activeFilters: ActiveFilterChip[];
  activeFilterCount: number;
  filterControls: ReactNode;
  isOptionsOpen: boolean;
  onClearSearch: () => void;
  onOptionsApply: () => void;
  onOptionsClose: () => void;
  onOptionsOpen: () => void;
  onOptionsReset: () => void;
  onRemoveFilter: (filter: ActiveFilterChip) => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  placeholder: string;
  searchValue: string;
  sortControl: ReactNode;
};

export function ArchiveSearchPanel({
  activeFilters,
  activeFilterCount,
  filterControls,
  isOptionsOpen,
  onClearSearch,
  onOptionsApply,
  onOptionsClose,
  onOptionsOpen,
  onOptionsReset,
  onRemoveFilter,
  onResetFilters,
  onSearchChange,
  placeholder,
  searchValue,
  sortControl,
}: ArchiveSearchPanelProps) {
  useEffect(() => {
    if (!isOptionsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOptionsClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOptionsOpen, onOptionsClose]);

  return (
    <section dir="rtl" className="relative z-10 mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-0 grow group">
            <FiSearch className="pointer-events-none absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors duration-300 group-focus-within:text-accent" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              type="search"
              aria-label={placeholder}
              autoComplete="off"
              placeholder={placeholder}
              className="h-14 w-full rounded-2xl border border-border bg-background/60 pr-14 pl-12 text-right text-sm font-bold text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-accent/50 focus:bg-background/90 focus:ring-4 focus:ring-accent/10 md:h-15"
            />
            {searchValue && (
              <button
                type="button"
                onClick={onClearSearch}
                aria-label="پاک کردن جستجو"
                className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground transition-all duration-200 hover:bg-red-500/20 hover:text-red-400"
              >
                <FiX className="h-5 w-5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onOptionsOpen}
            aria-label="فیلترها"
            title="فیلترها"
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition hover:border-accent hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 md:h-15 md:w-15"
          >
            <FiFilter className="text-lg" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-black text-button-text">
                {activeFilterCount}
              </span>
            )}
          </button>

        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
            <span className="ml-2 text-xs font-medium text-muted-foreground">
              فیلترهای فعال:
            </span>
            {activeFilters.map((filter) => (
              <button
                key={`${filter.key}-${filter.value ?? filter.label}`}
                type="button"
                onClick={() => onRemoveFilter(filter)}
                className="group flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-[11px] font-bold text-accent transition-all hover:border-accent hover:bg-accent hover:text-button-text"
              >
                {filter.label}
                <FiX className="h-3 w-3 opacity-50 group-hover:opacity-100" />
              </button>
            ))}
            <button
              type="button"
              onClick={onResetFilters}
              className="mr-auto flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-red-400/70 transition-colors hover:text-red-400"
            >
              <FiRefreshCcw className="h-3 w-3" />
              حذف همه فیلترها
            </button>
          </div>
        )}
      </div>

      {isOptionsOpen && (
        <div className="fixed inset-0 z-80 flex items-end justify-center p-3 sm:p-6 md:items-center">
          <button
            type="button"
            aria-label="بستن پنجرهٔ فیلترها"
            onClick={onOptionsClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-options-title"
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold text-accent">تنظیمات نمایش</p>
                <h2 id="archive-options-title" className="mt-1 text-lg font-black">
                  فیلتر و مرتب‌سازی
                </h2>
              </div>
              <button
                type="button"
                onClick={onOptionsClose}
                aria-label="بستن"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-muted-foreground transition hover:bg-accent/15 hover:text-accent"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
              <div>
                <h3 className="mb-3 text-sm font-black text-accent">فیلترها</h3>
                <div className="grid gap-2 sm:grid-cols-2">{filterControls}</div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-black text-accent">مرتب‌سازی</h3>
                {sortControl}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border bg-foreground/3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onOptionsReset}
                className="h-12 rounded-2xl px-4 text-sm font-black text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
              >
                پاک کردن انتخاب‌ها
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onOptionsClose}
                  className="h-12 flex-1 rounded-2xl border border-border px-5 text-sm font-black text-foreground transition hover:border-accent hover:bg-accent/10 sm:flex-none"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={onOptionsApply}
                  className="h-12 flex-1 rounded-2xl bg-accent px-5 text-sm font-black text-button-text transition hover:bg-accent-hover sm:flex-none"
                >
                  اعمال
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
