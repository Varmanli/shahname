import type { ReactNode } from "react";

type PageHeroHeaderProps = {
  action?: ReactNode;
  className?: string;
  description: ReactNode;
  eyebrow: string;
  highlight: ReactNode;
  title: ReactNode;
};

export function PageHeroHeader({
  action,
  className = "my-40 md:mb-36",
  description,
  eyebrow,
  highlight,
  title,
}: PageHeroHeaderProps) {
  return (
    <header
      className={`relative flex flex-col items-center px-5 text-center md:px-8 ${className}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.8em] text-shah-gold-600/60 dark:text-shah-gold-400/60">
          {eyebrow}
        </span>
      </div>

      <div className="flex items-start justify-center gap-3">
        <h1 className="text-5xl font-black tracking-tighter text-zinc-900 md:text-8xl dark:text-white">
          {title}{" "}
          <span className="text-shah-gold-500 drop-shadow-sm">
            {highlight}
          </span>
        </h1>
        {action}
      </div>

      <div className="mt-8 flex h-1 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="h-full w-1/3 bg-shah-lapis-500" />
        <div className="h-full w-2/3 bg-shah-gold-500" />
      </div>

      <p className="mt-7 max-w-2xl text-sm font-semibold leading-8 text-shah-black-500 dark:text-zinc-400 md:text-base">
        {description}
      </p>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-[0.025] dark:opacity-[0.05]">
        <svg
          width="340"
          height="340"
          viewBox="0 0 100 100"
          className="fill-shah-gold-500"
          aria-hidden="true"
        >
          <path d="M50 0L54 36L90 40L54 44L50 80L46 44L10 40L46 36Z" />
        </svg>
      </div>
    </header>
  );
}
