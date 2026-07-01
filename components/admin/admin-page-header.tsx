import Link from "next/link";

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
    <header className="relative overflow-hidden rounded-[2rem] border border-shah-gold-500/18 bg-white/82 p-6 text-card-foreground shadow-2xl shadow-shah-black-900/8 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30 md:p-8">
      <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-shah-gold-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-shah-lapis-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <p className="inline-flex rounded-full border border-shah-gold-500/20 bg-shah-gold-500/10 px-3 py-1 text-[11px] font-black tracking-[0.28em] text-shah-gold-800 uppercase dark:text-shah-gold-200">
            ADMIN PANEL
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-3xl text-base font-medium leading-8 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-shah-lapis-800 px-6 text-base font-black text-shah-gold-100 shadow-lg shadow-shah-lapis-900/20 transition duration-300 hover:-translate-y-0.5 hover:bg-shah-lapis-700 hover:text-white active:scale-95 dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
