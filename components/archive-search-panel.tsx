"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { FiRefreshCcw, FiSearch, FiSliders, FiX } from "react-icons/fi";

type ActiveFilterChip = {
  key: string;
  label: string;
  value?: string;
};

type ArchiveSearchPanelProps = {
  activeFilters: ActiveFilterChip[];
  filterControls: ReactNode;
  mobileFilterLabel?: string;
  onClearSearch: () => void;
  onMobileFiltersOpen: () => void;
  onRemoveFilter: (filter: ActiveFilterChip) => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onSearchKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  searchValue: string;
};

export function ArchiveSearchPanel({
  activeFilters,
  filterControls,
  mobileFilterLabel = "فیلترهای پیشرفته",
  onClearSearch,
  onMobileFiltersOpen,
  onRemoveFilter,
  onResetFilters,
  onSearchChange,
  onSearchKeyDown,
  placeholder,
  searchValue,
}: ArchiveSearchPanelProps) {
  return (
    <section
      dir="rtl"
      className="
        relative z-10 mx-auto w-full max-w-7xl
        rounded-4xl bg-shah-black-900/86 p-3 md:p-4
        backdrop-blur-3xl
        border border-white/10
        shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]
      "
    >
      <div className="flex flex-col gap-4">
        {/* Search Bar Container */}
        <div className="flex flex-col items-stretch gap-3 lg:flex-row">
          <div className="relative grow group">
            <FiSearch className="pointer-events-none absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30 group-focus-within:text-shah-gold-400 transition-colors duration-300" />

            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={placeholder}
              className="
                h-14 w-full rounded-full bg-black/40
                pr-14 pl-14 text-right text-sm font-bold text-white md:h-15
                outline-none border border-white/5 transition-all duration-300
                placeholder:text-white/20
                focus:bg-black/60 focus:border-shah-gold-400/50 focus:ring-4 focus:ring-shah-gold-400/10
              "
            />

            {searchValue && (
              <button
                type="button"
                onClick={onClearSearch}
                className="
                  absolute left-4 top-1/2 -translate-y-1/2
                  flex h-9 w-9 items-center justify-center rounded-full 
                  bg-white/5 text-white/50 hover:bg-red-500/20 hover:text-red-400
                  transition-all duration-200
                "
              >
                <FiX className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            type="button"
            onClick={onMobileFiltersOpen}
            className="
              flex h-14 items-center justify-center gap-3 rounded-full md:h-15
              bg-linear-to-tr from-shah-gold-600 to-shah-gold-400 
              px-8 text-sm font-bold text-black
              transition-transform active:scale-95 lg:hidden
              shadow-[0_8px_20px_rgba(212,175,55,0.2)]
            "
          >
            <FiSliders className="text-lg" />
            {mobileFilterLabel}
          </button>
        </div>

        {/* Desktop Filter Controls */}
        <div
          className="
            hidden lg:grid grid-cols-2 xl:grid-cols-5 gap-3 rounded-[1.6rem]
            bg-white/3 p-3 border border-white/5
          "
        >
          {filterControls}
        </div>

        {/* Active Filters / Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-2 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-medium text-white/40 ml-2">
              فیلترهای فعال:
            </span>
            {activeFilters.map((filter) => (
              <button
                key={`${filter.key}-${filter.value ?? filter.label}`}
                type="button"
                onClick={() => onRemoveFilter(filter)}
                className="
                  group flex items-center gap-2 rounded-lg bg-shah-gold-400/5
                  px-3 py-1.5 text-[11px] font-bold text-shah-gold-300/80
                  border border-shah-gold-400/10 transition-all
                  hover:bg-shah-gold-400 hover:text-black hover:border-shah-gold-400
                "
              >
                {filter.label}
                <FiX className="h-3 w-3 opacity-50 group-hover:opacity-100" />
              </button>
            ))}

            <button
              type="button"
              onClick={onResetFilters}
              className="
                mr-auto flex items-center gap-2 px-3 py-1.5
                text-[11px] font-bold text-red-400/70 hover:text-red-400
                transition-colors
              "
            >
              <FiRefreshCcw className="h-3 w-3" />
              حذف همه فیلترها
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
