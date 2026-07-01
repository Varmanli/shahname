import type { Metadata } from "next";

import { PageHeroHeader } from "@/components/page-hero-header";
import { SiteLayout } from "@/components/site-layout";
import { StoriesArchive } from "@/components/stories-archive";
import {
  parseArchiveParams,
  searchStoriesArchive,
  type StorySort,
} from "@/lib/archive-search";
import { pageMetadata } from "@/lib/seo";
import { readStories } from "@/lib/story-store";

export const metadata: Metadata = pageMetadata({
  title: "داستان‌های شاهنامه",
  description:
    "آرشیو روایت‌های حماسی شاهنامه فردوسی؛ از اسطوره تا پهلوانی و تاریخ، با جستجو، فیلتر شخصیت و ترتیب زمانی برای دنبال‌کردن سیر داستان‌ها.",
  path: "/stories",
});

export const dynamic = "force-dynamic";

type StoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const stories = await readStories();
  const params = await searchParams;
  const parsed = parseArchiveParams(params);
  const result = searchStoriesArchive(stories, {
    character: parsed.character,
    cursor: parsed.cursor,
    era: parsed.era,
    length: parsed.length,
    page: parsed.page,
    search: parsed.search,
    sort: ["newest", "popular", "reading-time"].includes(parsed.sort)
      ? (parsed.sort as StorySort)
      : "newest",
    theme: parsed.theme,
  });
  const characterOptions = Array.from(
    new Map(
      stories.flatMap((story) =>
        story.characters.map((character) => [character.slug, character.name] as const),
      ),
    ),
    ([slug, name]) => ({ name, slug }),
  ).sort((a, b) => a.name.localeCompare(b.name, "fa"));

  return (
    <SiteLayout withHeaderOffset>
      <main className="relative min-h-screen  pb-32 text-zinc-950  dark:text-shah-cream-100">
        {/* نورهای محیطی بسیار محو برای عمق دادن به صفحه */}
        <div className="absolute top-0 right-0 -z-10 h-150 w-150 rounded-full bg-shah-gold-500/5 blur-[120px] dark:bg-shah-gold-500/10" />
        <div className="absolute top-40 left-0 -z-10 h-100 w-100 rounded-full bg-shah-lapis-500/5 blur-[100px]" />

        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <PageHeroHeader
            description="مجموعه‌ای از روایت‌های شاهنامه، بازآفرینی‌شده در قالبی ساخت‌یافته و قابل جستجو، برای مرور سیر داستانی و پیوندهای میان شخصیت‌ها."
            eyebrow="Persian Epic Archive"
            highlight="روایت‌ها"
            title="دیوان"
          />
          {/* کامپوننت آرشیو که حالا شامل کارت‌های جدید ماست */}
          <StoriesArchive
            characterOptions={characterOptions}
            result={result}
            totalCount={stories.length}
          />
        </div>

        {/* پترن انتهای صفحه - فید شده در پس‌زمینه */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-full opacity-[0.03] dark:opacity-[0.05]">
          <div
            className="h-full w-full bg-repeat-x bg-bottom bg-contain"
            style={{
              backgroundImage: "url('/assets/images/pattern-islamic.png')",
            }}
          />
        </div>
      </main>
    </SiteLayout>
  );
}
