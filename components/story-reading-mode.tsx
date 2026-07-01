"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ReadingProgress } from "@/components/reading-progress";
import { SmoothScrollLink } from "@/components/smooth-scroll-link";
import { StoryEndingNavigation } from "@/components/story-ending-navigation";
import { StoryRichText } from "@/components/story-rich-text";
import type { StoryCharacterLinkData } from "@/lib/story-character-links";
import type { Story } from "@/types/story";

type StoryReadingModeProps = {
  characters?: StoryCharacterLinkData[];
  nextStory?: Story;
  previousStory?: Story;
  story: Story;
};

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function getReadingSectionAnchor(sectionId: string) {
  return `reading-section-${sectionId}`;
}

export function StoryReadingMode({
  characters = [],
  nextStory,
  previousStory,
  story,
}: StoryReadingModeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="
    group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden
    rounded-2xl border border-shah-gold-500/25
    bg-linear-to-br from-shah-gold-500/15 via-shah-gold-400/10 to-transparent
    px-5 py-4 text-sm font-black text-shah-gold-900
    shadow-[0_10px_35px_rgba(212,175,55,0.12)]
    backdrop-blur-xl transition-all duration-500

    hover:-translate-y-1
    hover:border-shah-gold-500/45
    hover:shadow-[0_18px_45px_rgba(212,175,55,0.22)]

    active:scale-[0.98]

    dark:border-shah-gold-400/20
    dark:from-shah-gold-400/15
    dark:via-shah-gold-300/10
    dark:text-shah-gold-100
    dark:shadow-[0_14px_40px_rgba(0,0,0,0.35)]

    sm:w-auto sm:min-w-47.5
  "
      >
        {/* Glow */}
        <span
          className="
      absolute inset-0 opacity-0 transition-opacity duration-500
      group-hover:opacity-100
    "
        >
          <span
            className="
        absolute inset-x-0 top-0 h-px
        bg-linear-to-r from-transparent via-shah-gold-400/80 to-transparent
      "
          />
          <span
            className="
        absolute -left-10 top-0 h-full w-24 rotate-12
        bg-white/20 blur-2xl
      "
          />
        </span>

        {/* Text */}
        <span className="relative z-10 tracking-tight">حالت مطالعه</span>

        {/* Icon */}
        <span
          className="
      relative z-10 flex size-9 items-center justify-center
      rounded-xl border border-shah-gold-500/20
      bg-white/60 text-shah-gold-700
      transition-all duration-500

      group-hover:rotate-6
      group-hover:scale-110
      group-hover:bg-shah-gold-500
      group-hover:text-white

      dark:bg-white/10
      dark:text-shah-gold-200
      dark:group-hover:bg-shah-gold-400
      dark:group-hover:text-shah-black-950
    "
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"
            />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div
          id="story-reading-scroll"
          className="fixed inset-0 z-100 overflow-y-auto bg-shah-cream-50 text-shah-black-950 dark:bg-[#080808] dark:text-shah-cream-100"
          role="dialog"
          aria-modal="true"
          aria-label={`مطالعه تمام‌صفحه ${story.title}`}
        >
          <ReadingProgress
            scrollContainerId="story-reading-scroll"
            targetId="story-reading-content"
          />
          <div className="sticky top-0 z-20 border-b border-shah-gold-500/18 bg-shah-cream-50/90 px-5 py-4 backdrop-blur-xl dark:border-shah-gold-500/15 dark:bg-[#080808]/90">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
              <div className="min-w-0 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-shah-gold-700 dark:text-shah-gold-300">
                  حالت مطالعه
                </p>
                <h2 className="mt-1 truncate text-xl font-black md:text-2xl">
                  {story.title}
                </h2>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-shah-gold-500/25 bg-white/70 text-lg font-black text-shah-gold-800 transition hover:bg-shah-gold-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-shah-gold-500/30 dark:bg-white/5 dark:text-shah-gold-100 dark:hover:bg-shah-gold-400 dark:hover:text-shah-black-950"
                aria-label="بستن حالت مطالعه"
              >
                ×
              </button>
            </div>
          </div>

          <main
            id="story-reading-content"
            className="mx-auto max-w-4xl scroll-mt-24 px-5 py-12 md:py-16"
          >
            <header className="mb-12 border-b border-shah-gold-500/15 pb-10 text-right">
              <span className="text-xs font-black text-shah-gold-700 dark:text-shah-gold-300">
                روایت {toFaNumber(story.order)}
              </span>
              <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
                {story.title}
              </h1>
              {story.subtitle ? (
                <p className="mt-5 text-2xl font-black leading-10 text-decorative dark:text-shah-gold-300">
                  {story.subtitle}
                </p>
              ) : null}
            </header>

            {story.sections.length ? (
              <nav
                className="
    mb-14
    rounded-4xl
    border border-shah-gold-500/15
    bg-white/80
    p-6
    shadow-[0_24px_70px_-40px_rgba(0,0,0,0.45)]
    backdrop-blur-xl
    dark:border-white/10 dark:bg-white/4
  "
                aria-label="فهرست بخش‌های حالت مطالعه"
              >
                {/* عنوان */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-shah-gold-500/50" />

                  <p className="text-xs font-black tracking-wider text-shah-gold-700 dark:text-shah-gold-300">
                    بخش‌های روایت
                  </p>
                </div>

                {/* لیست */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {story.sections.map((section, index) => (
                    <SmoothScrollLink
                      key={section.id}
                      href={`#${getReadingSectionAnchor(section.id)}`}
                      className="
          group flex items-center gap-3
          rounded-xl
          px-4 py-3
          text-right
          transition-all duration-200

          bg-shah-cream-50/70
          hover:bg-shah-gold-500/10
          hover:border-shah-gold-500/30

          dark:bg-white/4
          dark:hover:bg-shah-gold-400/10

        "
                    >
                      {/* شماره */}
                      <span
                        className="
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-lg
            text-[11px] font-black

            text-shah-gold-600
            bg-shah-gold-500/10

            transition-all duration-300
            group-hover:bg-shah-gold-500
            group-hover:text-white
          "
                      >
                        {toFaNumber(index + 1)}
                      </span>

                      {/* عنوان */}
                      <span
                        className="
            min-w-0 truncate
            text-sm font-black
            text-zinc-700
            transition-colors duration-300

            group-hover:text-shah-gold-600
            dark:text-zinc-300
            dark:group-hover:text-shah-gold-200
          "
                      >
                        {section.title}
                      </span>
                    </SmoothScrollLink>
                  ))}
                </div>
              </nav>
            ) : null}

            <div className="space-y-14 text-right">
              {story.content ? (
                <StoryRichText
                  characters={characters}
                  html={story.content}
                  className="character-story text-[1.45rem] leading-[2.9] text-shah-black-800 dark:text-shah-cream-100/88"
                />
              ) : null}

              {story.sections.map((section, index) => (
                <section
                  id={getReadingSectionAnchor(section.id)}
                  key={section.id}
                  className="scroll-mt-28 border-t border-shah-gold-500/15 pt-10"
                >
                  <div className="mb-8 flex items-center gap-4">
                    <span
                      className="
      relative flex h-10 w-10 items-center justify-center
      rounded-lg
      bg-shah-gold-500/10
      text-sm font-black text-shah-gold-600
      tabular-nums

      before:absolute before:inset-0
      before:rounded-lg
      before:border before:border-shah-gold-500/30
    "
                    >
                      {toFaNumber(index + 1)}
                    </span>

                    <h2 className="text-2xl font-black leading-10 text-zinc-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>

                  <StoryRichText
                    characters={characters}
                    html={section.content}
                    className="character-story text-[1.45rem] leading-[2.9] text-shah-black-800 dark:text-shah-cream-100/88"
                  />

                  {section.image ? (
                    <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl border border-shah-gold-500/20 bg-muted shadow-card">
                      <Image
                        src={section.image}
                        alt={section.title}
                        fill
                        sizes="(min-width: 1024px) 800px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
            <StoryEndingNavigation
              nextStory={nextStory}
              previousStory={previousStory}
            />
          </main>
        </div>
      ) : null}
    </>
  );
}
