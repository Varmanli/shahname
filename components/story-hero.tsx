import Image from "next/image";
import Link from "next/link";
import { HiOutlineClock } from "react-icons/hi2";

import { SmoothScrollLink } from "@/components/smooth-scroll-link";
import {
  calculateStoryReadingTime,
  formatReadingTimeFa,
} from "@/lib/reading-time";
import type { Story } from "@/types/story";

type StoryHeroProps = {
  story: Story;
};

export function StoryHero({ story }: StoryHeroProps) {
  const readingTimeMinutes =
    story.readingTimeMinutes ?? calculateStoryReadingTime(story);

  return (
    <section className="relative min-h-svh w-full overflow-hidden bg-shah-black-950 lg:min-h-[120vh]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {story.coverImage ? (
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            priority
            className="object-cover opacity-80"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-shah-lapis-950 via-shah-black-950 to-shah-gold-950" />
        )}

        <div className="absolute inset-0 bg-linear-to-l from-black/80 via-black/45 to-black/10" />
        <div className="absolute inset-0 bg-linear-to-t from-shah-black-950 via-shah-black-950/20 to-transparent" />
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.85)]" />
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 z-1 h-72 bg-linear-to-t from-shah-cream-50 via-shah-cream-50/60 to-transparent dark:from-shah-black-950 dark:via-shah-black-950/70" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl items-center px-5 pb-28 pt-32 sm:px-6 lg:min-h-[110vh] lg:px-12 lg:pb-40 lg:pt-44">
        <div className="w-full max-w-5xl animate-fade-up text-right" dir="rtl">
          {/* Breadcrumb */}
          <nav className="mb-7 flex flex-wrap items-center gap-3">
            <Link
              href="/stories"
              className="group inline-flex items-center gap-2 rounded-full border border-shah-gold-400/15 bg-black/20 px-4 py-2 text-xs font-black tracking-widest text-shah-gold-300 backdrop-blur-xl transition-all duration-300 hover:border-shah-gold-400/40 hover:bg-shah-gold-500 hover:text-shah-black-950"
            >
              <svg
                className="size-3 rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              بازگشت به دیوان
            </Link>

            <span className="hidden h-px w-8 bg-shah-gold-500/30 sm:block" />

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/55 backdrop-blur-xl">
              روایت جاری
            </span>
          </nav>

          {/* Title */}
          <header className="max-w-5xl">
            <h1 className="text-5xl font-black leading-[1.08] text-white drop-shadow-[0_14px_40px_rgba(0,0,0,0.6)] sm:text-6xl md:text-8xl lg:text-9xl">
              {story.title}
            </h1>

            <div className="mt-7 flex items-center gap-3">
              <span className="h-1.5 w-24 rounded-full bg-shah-gold-500" />
              <span className="h-1.5 w-10 rounded-full bg-shah-gold-500/35" />
              <span className="h-1.5 w-3 rounded-full bg-shah-gold-500/20" />
            </div>
          </header>

          {/* Description + Actions */}
          <div className="mt-8 flex max-w-3xl flex-col items-start gap-6">
            {story.subtitle ? (
              <p className="text-lg font-bold leading-9 text-shah-cream-100/90 drop-shadow-md sm:text-xl md:text-3xl md:leading-[1.7]">
                {story.subtitle}
              </p>
            ) : null}

            {/* Meta + CTA Panel */}
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-shah-gold-400/20 bg-black/30 px-5 py-3 text-sm font-black text-shah-gold-100 shadow-[0_12px_35px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:w-auto">
                <HiOutlineClock className="size-4 text-shah-gold-400" />
                <span>{formatReadingTimeFa(readingTimeMinutes)}</span>
              </div>

              <SmoothScrollLink
                href="#story-content"
                aria-label="آغاز خواندن روایت"
                className="group relative inline-flex w-full items-center justify-center rounded-2xl p-px transition-all duration-500 hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto"
              >
                <span className="absolute inset-0 rounded-2xl bg-linear-to-l from-shah-gold-300/20 via-shah-gold-500/80 to-shah-gold-300/20 opacity-70 blur-[1px] transition-all duration-500 group-hover:opacity-100 group-hover:blur-[2px]" />

                <span className="absolute -inset-4 rounded-2xl bg-shah-gold-500/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <span className="relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-shah-black-950/85 px-7 py-3.5 text-sm font-black text-shah-gold-300 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-500 group-hover:border-shah-gold-400/40 group-hover:bg-shah-gold-500 group-hover:text-shah-black-950 group-hover:shadow-[0_22px_70px_rgba(234,179,8,0.22)] sm:w-auto sm:px-8 sm:py-4 sm:text-base">
                  <span className="pointer-events-none absolute inset-y-0 -right-16 w-12 rotate-12 bg-white/20 blur-md transition-transform duration-700 group-hover:-translate-x-80" />

                  <span className="relative">آغاز خواندن روایت</span>

                  <span className="relative grid size-7 place-items-center rounded-full border border-shah-gold-400/30 bg-shah-gold-400/10 transition-all duration-500 group-hover:border-shah-black-950/20 group-hover:bg-shah-black-950/10">
                    <svg
                      className="animate-[arrowBounce_2.6s_ease-in-out_infinite] transition-all duration-500 group-hover:translate-y-0.5 group-hover:animate-[arrowBounce_1s_ease-in-out_infinite]"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 5V19M12 19L19 12M12 19L5 12"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              </SmoothScrollLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
