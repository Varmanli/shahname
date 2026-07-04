"use client";

import type { ReactNode } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export type AdminPaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function getVisiblePages(currentPage: number, totalPages: number) {
  const delta = 1;
  const pages = new Set<number>([1, totalPages]);

  for (
    let page = Math.max(1, currentPage - delta);
    page <= Math.min(totalPages, currentPage + delta);
    page++
  ) {
    pages.add(page);
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export function AdminPagination({
  className = "",
  onPageChange,
  page,
  pageSize,
  totalItems,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));

  if (totalPages <= 1) return null;

  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  function goTo(nextPage: number) {
    const clamped = Math.min(Math.max(nextPage, 1), totalPages);
    if (clamped !== currentPage) onPageChange(clamped);
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav
      aria-label="صفحه‌بندی"
      className={`flex w-full justify-center ${className}`.trim()}
    >
      <div className="relative max-w-full  overflow-hidden rounded-[1.6rem] border border-shah-gold-500/14 bg-white/72 p-2 shadow-xl shadow-shah-black-900/6 backdrop-blur-2xl dark:border-white/10 dark:bg-white/4.5">
        <div className="pointer-events-none absolute -left-16 -top-16 size-40 rounded-full bg-shah-gold-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-10 size-44 rounded-full bg-shah-lapis-500/10 blur-3xl" />

        <div className="relative flex max-w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden shrink-0 items-center rounded-2xl border border-shah-gold-500/10 bg-white/55 px-4 py-2 text-xs font-black text-muted-foreground dark:border-white/8 dark:bg-white/[0.035] md:flex">
            نمایش {toFaNumber(startItem)} تا {toFaNumber(endItem)} از{" "}
            {toFaNumber(totalItems)}
          </div>

          <div className="flex max-w-full items-center justify-center gap-1.5 overflow-x-auto custom-scrollbar">
            <PageButton
              disabled={currentPage === 1}
              onClick={() => goTo(currentPage - 1)}
              variant="control"
            >
              <HiChevronRight aria-hidden className="size-4" />
              <span className="hidden sm:inline">قبلی</span>
            </PageButton>

            <div className="mx-1 hidden h-7 w-px shrink-0 bg-shah-gold-500/14 dark:bg-white/10 sm:block" />

            {visiblePages.map((pageNumber, index) => {
              const previousPage = visiblePages[index - 1];
              const hasGap =
                previousPage !== undefined && pageNumber - previousPage > 1;

              return (
                <span className="flex items-center gap-1.5" key={pageNumber}>
                  {hasGap ? <PaginationDots /> : null}

                  <PageButton
                    active={pageNumber === currentPage}
                    onClick={() => goTo(pageNumber)}
                  >
                    {toFaNumber(pageNumber)}
                  </PageButton>
                </span>
              );
            })}

            <div className="mx-1 hidden h-7 w-px shrink-0 bg-shah-gold-500/14 dark:bg-white/10 sm:block" />

            <PageButton
              disabled={currentPage === totalPages}
              onClick={() => goTo(currentPage + 1)}
              variant="control"
            >
              <span className="hidden sm:inline">بعدی</span>
              <HiChevronLeft aria-hidden className="size-4" />
            </PageButton>
          </div>

          <div className="flex shrink-0 justify-center rounded-2xl border border-shah-gold-500/10 bg-white/55 px-4 py-2 text-xs font-black text-muted-foreground dark:border-white/8 dark:bg-white/[0.035] md:hidden">
            صفحه {toFaNumber(currentPage)} از {toFaNumber(totalPages)}
          </div>
        </div>
      </div>
    </nav>
  );
}

function PaginationDots() {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 shrink-0 place-items-center text-sm font-black text-muted-foreground/55"
    >
      …
    </span>
  );
}

function PageButton({
  active,
  children,
  disabled,
  onClick,
  variant = "page",
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  variant?: "page" | "control";
}) {
  const sizeClass =
    variant === "control"
      ? "min-w-10 px-3 sm:min-w-20 sm:px-4"
      : "min-w-10 px-3";

  const stateClass = active
    ? "border-shah-lapis-900 bg-shah-lapis-900 text-shah-gold-100 shadow-lg shadow-shah-lapis-900/20 dark:border-shah-gold-400 dark:bg-shah-gold-500 dark:text-shah-black-950 dark:shadow-shah-gold-500/10"
    : "border-transparent bg-transparent text-foreground/75 hover:border-shah-gold-500/24 hover:bg-shah-gold-500/10 hover:text-foreground dark:hover:border-white/10 dark:hover:bg-white/[0.065]";

  return (
    <button
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled}
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border text-xs font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-35 ${sizeClass} ${stateClass}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
