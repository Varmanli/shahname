import Link from "next/link";
import { FiArrowLeft, FiPlus } from "react-icons/fi";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AdminPageHeader({
  actionHref,
  actionLabel,
  description,
  title,
}: AdminPageHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden rounded-[1.6rem] border border-shah-gold-500/12 bg-white/70 p-4 text-card-foreground shadow-lg shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 dark:shadow-black/20 md:p-5">
      <div className="pointer-events-none absolute -left-20 -top-24 size-56 rounded-full bg-shah-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-8 size-60 rounded-full bg-shah-lapis-500/8 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black leading-tight tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-2 max-w-3xl text-xs font-bold leading-6 text-muted-foreground md:text-sm">
              {description}
            </p>
          ) : null}
        </div>

        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-shah-lapis-700/10 bg-shah-lapis-900 px-4 text-xs font-black text-shah-gold-100 shadow-md shadow-shah-lapis-900/15 transition duration-200 hover:-translate-y-0.5 hover:bg-shah-lapis-800 hover:text-white active:scale-95 dark:border-shah-gold-300/15 dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400 md:h-11 md:px-5 md:text-sm"
          >
            <span className="grid size-7 place-items-center rounded-lg bg-white/10 transition group-hover:bg-white/15 dark:bg-shah-black-950/10">
              <FiPlus aria-hidden className="size-3.5" />
            </span>

            <span>{actionLabel}</span>

            <FiArrowLeft
              aria-hidden
              className="size-3.5 opacity-60 transition group-hover:-translate-x-0.5 group-hover:opacity-100"
            />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
