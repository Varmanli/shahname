import Link from "next/link";
import type { ReactNode } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

type PaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  queryParam?: string;
};

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

function buildHref(basePath: string, page: number, queryParam: string) {
  return page === 1 ? basePath : `${basePath}?${queryParam}=${page}`;
}

export function Pagination({
  basePath,
  currentPage,
  queryParam = "page",
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      dir="rtl"
      className="mx-auto mt-10 flex w-full items-center justify-center"
      aria-label="صفحه‌بندی"
    >
      <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-shah-gold-500/15 bg-white/75 p-2 shadow-[0_18px_50px_rgba(24,24,27,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-black/25">
        <PageLink
          variant="control"
          disabled={currentPage === 1}
          href={buildHref(basePath, Math.max(currentPage - 1, 1), queryParam)}
        >
          <HiChevronRight className="size-5" />
          <span className="hidden sm:inline">قبلی</span>
        </PageLink>

        <div className="mx-1 h-7 w-px bg-zinc-200 dark:bg-white/10" />

        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];
          const hasGap = previousPage && page - previousPage > 1;

          return (
            <div className="flex items-center gap-2" key={page}>
              {hasGap ? <PaginationDots /> : null}

              <PageLink
                active={page === currentPage}
                href={buildHref(basePath, page, queryParam)}
              >
                {page.toLocaleString("fa-IR")}
              </PageLink>
            </div>
          );
        })}

        <div className="mx-1 h-7 w-px bg-zinc-200 dark:bg-white/10" />

        <PageLink
          variant="control"
          disabled={currentPage === totalPages}
          href={buildHref(
            basePath,
            Math.min(currentPage + 1, totalPages),
            queryParam,
          )}
        >
          <span className="hidden sm:inline">بعدی</span>
          <HiChevronLeft className="size-5" />
        </PageLink>
      </div>
    </nav>
  );
}

function PaginationDots() {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 min-w-10 items-center justify-center rounded-xl text-sm font-black text-zinc-400 dark:text-zinc-500"
    >
      …
    </span>
  );
}

function PageLink({
  active,
  children,
  disabled,
  href,
  variant = "page",
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  href: string;
  variant?: "page" | "control";
}) {
  const baseClass =
    "group relative inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border text-sm font-black transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shah-gold-500/50";

  const sizeClass = variant === "control" ? "px-4" : "min-w-11 px-3";

  const stateClass = active
    ? "border-shah-gold-500 bg-shah-gold-500 text-white shadow-lg shadow-shah-gold-900/20"
    : "border-zinc-200 bg-white text-zinc-700 hover:-translate-y-0.5 hover:border-shah-gold-500/50 hover:bg-shah-gold-50 hover:text-shah-gold-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-shah-gold-500/40 dark:hover:bg-shah-gold-500/10 dark:hover:text-shah-gold-300";

  const disabledClass = disabled
    ? "pointer-events-none cursor-not-allowed opacity-35"
    : "active:scale-95";

  return (
    <Link
      aria-disabled={disabled}
      aria-current={active ? "page" : undefined}
      className={`${baseClass} ${sizeClass} ${stateClass} ${disabledClass}`}
      href={href}
      scroll
    >
      {children}
    </Link>
  );
}
