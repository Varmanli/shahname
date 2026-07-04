import Image from "next/image";
import Link from "next/link";

import { shouldUseUnoptimizedImage } from "@/lib/images";
import type { Story } from "@/types/story";

type StoryCardProps = {
  animationDelay?: string;
  story: Story;
};

function plainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function getStoryCoverImage(story: Story) {
  return story.coverImage?.trim() || "/images/ferdosi.png";
}

export function StoryCard({ animationDelay, story }: StoryCardProps) {
  const coverImage = getStoryCoverImage(story);

  return (
    <Link
      dir="rtl"
      href={`/stories/${encodeURIComponent(story.slug)}`}
      style={animationDelay ? { animationDelay } : undefined}
      className="
        group relative flex h-full animate-fade-up flex-col overflow-hidden
        rounded-2xl border border-shah-gold-500/20 bg-card
        shadow-card transition-all duration-500 ease-out
        hover:-translate-y-2 hover:border-shah-gold-400/60
        hover:shadow-[0_30px_70px_-20px_rgba(184,134,11,0.25)]
        dark:bg-shah-black-950/50 dark:backdrop-blur-md
      "
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={coverImage}
          alt={`کاور داستان ${story.title}`}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="
            z-0 object-cover transition-transform duration-1000 ease-out
            group-hover:scale-110
          "
          unoptimized={shouldUseUnoptimizedImage(coverImage)}
        />

        <div className="absolute top-4 right-4 z-20 flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 rotate-45 rounded-xl border border-shah-gold-300/30 bg-shah-black-900/60 backdrop-blur-md transition-transform duration-700 group-hover:rotate-90" />
          <span className="relative text-xs font-black text-shah-gold-300">
            {toFaNumber(story.order)}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-6 pt-4">
        <div className="mb-4 h-px w-12 bg-linear-to-l from-shah-gold-500 to-transparent" />

        <h3 className="text-right text-2xl font-black leading-9 text-foreground transition-all duration-300 group-hover:text-accent">
          {story.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-right text-sm font-medium leading-7 text-muted-foreground/80 transition-colors group-hover:text-muted-foreground">
          {plainText(story.subtitle)}
        </p>

        <div className="mt-auto flex items-center justify-end pt-6">
          <div
            className="
              group/btn relative flex items-center gap-3 overflow-hidden
              rounded-full bg-accent-soft px-6 py-2.5
              text-xs font-black text-accent transition-all duration-500
              hover:bg-accent hover:text-button-text
            "
          >
            <span className="relative z-10">خواندن روایت</span>
            <svg
              className="relative z-10 h-4 w-4 rotate-180 transition-transform duration-500 group-hover/btn:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-3 rounded-[1.8rem] border border-shah-gold-500/0 transition-all duration-500 group-hover:border-shah-gold-500/10" />
      <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-shah-gold-500/15 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
