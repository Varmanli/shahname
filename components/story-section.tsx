import Image from "next/image";

import { StoryRichText } from "@/components/story-rich-text";
import type { StoryCharacterLinkData } from "@/lib/story-character-links";
import type { StorySection as StorySectionType } from "@/types/story";

type StorySectionProps = {
  anchorId?: string;
  characters?: StoryCharacterLinkData[];
  section: StorySectionType;
  index?: number;
};

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export function StorySection({
  anchorId,
  characters = [],
  index,
  section,
}: StorySectionProps) {
  const sectionNumber =
    typeof index === "number" ? toFaNumber(index + 1) : null;

  return (
    <section
      id={anchorId}
      className="grid scroll-mt-28 gap-6 border-b border-border/70 py-12 last:border-b-0"
    >
      <div className="mb-8 flex items-center gap-4" dir="rtl">
        {sectionNumber ? (
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
            {sectionNumber}
          </span>
        ) : null}

        <h2 className="text-2xl font-black leading-10 text-zinc-900 dark:text-white">
          {section.title}
        </h2>
      </div>
      <StoryRichText
        characters={characters}
        html={section.content}
        className="character-story text-right text-xl leading-loose text-shah-black-800 dark:text-zinc-200/90"
      />
      <div className="my-4 flex items-center justify-center gap-3">
        <span className="h-px w-20 bg-linear-to-l from-transparent to-shah-gold-500/45" />
        <span className="size-2 rotate-45 bg-shah-gold-500/80 shadow-[0_0_12px_rgba(184,134,11,0.45)]" />
        <span className="h-px w-20 bg-linear-to-r from-transparent to-shah-gold-500/45" />
      </div>
      {section.image ? (
        <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl border border-shah-gold-500/20 bg-muted shadow-card">
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
  );
}
