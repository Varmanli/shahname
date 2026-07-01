import Link from "next/link";

import type { Story } from "@/types/story";

export function StoryEndingNavigation({
  nextStory,
  previousStory,
  variant = "default",
}: {
  nextStory?: Story;
  previousStory?: Story;
  variant?: "dark" | "default";
}) {
  if (!nextStory && !previousStory) return null;

  const isDark = variant === "dark";

  return (
    <section
      className={`relative mt-24 overflow-hidden rounded-[2.25rem] border p-6 text-right shadow-[0_30px_90px_rgba(26,26,26,0.10)] backdrop-blur-xl md:p-8 ${
        isDark
          ? "border-shah-gold-500/18 bg-white/6 shadow-black/30"
          : "border-shah-gold-500/18 bg-white/82 dark:border-white/10 dark:bg-white/5.5 dark:shadow-black/30"
      }`}
    >
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-shah-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-16 size-72 rounded-full bg-shah-lapis-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2
            className={`mt-3 text-3xl font-black tracking-tight md:text-4xl ${
              isDark ? "text-white" : "text-zinc-900 dark:text-white"
            }`}
          >
            ادامه مسیر روایت
          </h2>

          <p
            className={`mt-3 max-w-2xl text-sm font-semibold leading-7 ${
              isDark
                ? "text-shah-cream-100/65"
                : "text-shah-black-500 dark:text-zinc-400"
            }`}
          >
            فصل پیشین یا روایت بعدی را دنبال کنید و مسیر داستان‌های شاهنامه را
            پیوسته‌تر بخوانید.
          </p>
        </div>

        <Link
          href="/stories"
          className={`inline-flex h-12 shrink-0 items-center justify-center rounded-2xl border px-5 text-sm font-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-shah-gold-500 hover:text-white hover:shadow-[0_14px_35px_rgba(212,175,55,0.20)] ${
            isDark
              ? "border-shah-gold-500/25 text-shah-gold-100 hover:text-black"
              : "border-shah-gold-500/25 text-shah-gold-800 dark:text-shah-gold-100 dark:hover:text-black"
          }`}
        >
          دیوان روایت‌ها
        </Link>
      </div>

      <div className="relative mt-8 grid gap-4 md:grid-cols-2">
        {previousStory ? (
          <StoryNavCard
            dark={isDark}
            label="روایت قبلی"
            story={previousStory}
          />
        ) : (
          <EmptyNavCard dark={isDark} label="روایت قبلی" />
        )}

        {nextStory ? (
          <StoryNavCard dark={isDark} label="روایت بعدی" story={nextStory} />
        ) : (
          <EmptyNavCard dark={isDark} label="روایت بعدی" />
        )}
      </div>
    </section>
  );
}

function StoryNavCard({
  dark = false,
  label,
  story,
}: {
  dark?: boolean;
  label: string;
  story: Story;
}) {
  return (
    <Link
      href={`/stories/${encodeURIComponent(story.slug)}`}
      className={`group rounded-3xl border p-5 transition hover:-translate-y-1 hover:border-shah-gold-500/40 ${
        dark
          ? "border-white/10 bg-black/18"
          : "border-shah-gold-500/16 bg-white/70 dark:border-white/10 dark:bg-black/18"
      }`}
    >
      <span
        className={`text-[11px] font-black ${
          dark
            ? "text-shah-gold-300"
            : "text-shah-gold-700 dark:text-shah-gold-300"
        }`}
      >
        {label}
      </span>
      <h4
        className={`mt-2 text-2xl font-black group-hover:text-shah-gold-700 ${
          dark ? "text-white" : "text-zinc-900 dark:text-white"
        }`}
      >
        {story.title}
      </h4>
      {story.subtitle ? (
        <p className="mt-2 line-clamp-2 text-sm font-bold leading-7 text-muted-foreground">
          {story.subtitle}
        </p>
      ) : null}
    </Link>
  );
}

function EmptyNavCard({
  dark = false,
  label,
}: {
  dark?: boolean;
  label: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-dashed p-5 text-muted-foreground ${
        dark ? "border-white/10 bg-white/4" : "border-border bg-muted/25"
      }`}
    >
      <span className="text-[11px] font-black">{label}</span>
      <p className="mt-2 text-sm font-bold">
        روایتی برای این سمت ثبت نشده است.
      </p>
    </div>
  );
}
