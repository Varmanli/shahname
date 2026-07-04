import type { Metadata } from "next";

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
        story.characters.map(
          (character) => [character.slug, character.name] as const,
        ),
      ),
    ),
    ([slug, name]) => ({ name, slug }),
  ).sort((a, b) => a.name.localeCompare(b.name, "fa"));

  return (
    <SiteLayout withHeaderOffset>
      <StoriesArchive
        characterOptions={characterOptions}
        result={result}
        totalCount={stories.length}
      />
    </SiteLayout>
  );
}
