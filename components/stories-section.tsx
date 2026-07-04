import Link from "next/link";

import { StoryCard } from "@/components/story-card";
import type { Story } from "@/types/story";

type StoriesSectionProps = {
  stories: Story[];
};

export function StoriesSection({ stories }: StoriesSectionProps) {
  const featuredStories = stories.slice(0, 6);

  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 pb-10">
      {/* هدر بازطراحی شده: کاملاً یکسان با بخش شخصیت‌ها */}
      <header className="relative mb-40 flex flex-col items-center text-center">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.8em] text-shah-gold-600/60">
            Chronicles of Ancient Kings
          </span>
        </div>

        <h2 className="text-4xl font-black tracking-tighter text-zinc-900 md:text-8xl dark:text-white">
          روایت‌های{" "}
          <span className="text-shah-gold-500 drop-shadow-sm">ماندگار</span>
        </h2>

        {/* خط تزیینی زیر عنوان - امضای بصری سایت */}
        <div className="mt-8 flex h-1 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full w-2/3 bg-shah-gold-500" />
          <div className="h-full w-1/3 bg-shah-lapis-500" />
        </div>
      </header>

      {featuredStories.length > 0 ? (
        <div className="grid grid-cols-1 gap-10 pb-20 lg:grid-cols-3">
          {featuredStories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              animationDelay={`${index * 120}ms`}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-[3rem] border-2 border-dashed border-shah-gold-500/20 bg-shah-gold-500/5 py-24 text-center backdrop-blur-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-shah-gold-100 dark:bg-shah-gold-900/20">
            <span className="text-3xl">📜</span>
          </div>
          <p className="text-muted-foreground font-bold text-xl">
            هنوز روایتی در این دیوان نگاشته نشده است.
          </p>
        </div>
      )}
      {/* دکمه "مشاهده دیوان کامل" - کپی دقیق دکمه تالار شخصیت‌ها */}
      <div className="mt-32 flex justify-center">
        <Link
          href="/stories"
          className="group relative inline-flex h-16 items-center justify-center px-16 overflow-hidden rounded-xl bg-shah-lapis-700 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(26,62,141,0.4)] active:scale-95"
        >
          <div className="absolute inset-0 bg-linear-to-r from-shah-lapis-800 via-shah-lapis-600 to-shah-lapis-800 opacity-100 transition-all duration-500 group-hover:via-shah-lapis-500" />
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="h-2 w-2 rotate-45 border border-shah-gold-300 opacity-50 transition-all duration-500 group-hover:rotate-180 group-hover:border-shah-gold-400 group-hover:opacity-100" />
            <span className="text-sm md:text-lg font-black tracking-tight text-shah-gold-50 transition-colors duration-500 group-hover:text-white">
              مشاهده دیوان کامل
            </span>
            <div className="flex items-center transition-transform duration-500 group-hover:-translate-x-2">
              <svg
                className="h-5 w-5 text-shah-gold-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 12H5M12 19l-7-7 7-7"
                />
              </svg>
            </div>
            <div className="h-2 w-2 rotate-45 border border-shah-gold-300 opacity-50 transition-all duration-500 group-hover:rotate-180 group-hover:border-shah-gold-400 group-hover:opacity-100" />
          </div>

          <div className="absolute inset-0 rounded-xl border border-shah-gold-500/20 transition-all duration-500 group-hover:border-shah-gold-400/50 group-hover:inset-1" />
          <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-shah-gold-400 shadow-[0_0_12px_#f6b81f] transition-all duration-500 group-hover:w-1/2" />
        </Link>
      </div>

      {/* پترن محو عمقی که از وسط سکشن می‌گذرد */}
      <div className="absolute top-0 left-1/2 -z-10 h-full w-px -translate-x-1/2 bg-linear-to-b from-transparent via-shah-gold-500/10 to-transparent" />
    </section>
  );
}
