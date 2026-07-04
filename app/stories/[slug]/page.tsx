import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { ReadingProgress } from "@/components/reading-progress";
import { SiteLayout } from "@/components/site-layout";
import { StoryEndingNavigation } from "@/components/story-ending-navigation";
import { StoryHero } from "@/components/story-hero";
import { StoryReadingMode } from "@/components/story-reading-mode";
import { StoryRichText } from "@/components/story-rich-text";
import { StorySection } from "@/components/story-section";
import { StoryToc } from "@/components/story-toc";
import { recordPageView } from "@/lib/analytics-store";
import { readCharacters } from "@/lib/character-store";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
  buildDescription,
} from "@/lib/seo";
import { toStoryCharacterLinkData } from "@/lib/story-character-links";
import { readStories } from "@/lib/story-store";
import type { Character } from "@/types/character";
import type { Story } from "@/types/story";

type StoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getStorySectionAnchor(sectionId: string) {
  return `story-section-${sectionId}`;
}

async function getStory(slug: string) {
  const stories = await readStories();
  const decodedSlug = safeDecode(slug);

  return (
    stories.find((story) => story.slug === decodedSlug) ??
    stories.find((story) => story.slug === slug) ??
    stories.find((story) => story.id === decodedSlug) ??
    null
  );
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);

  if (!story) {
    return {
      title: "داستان پیدا نشد",
      robots: { index: false, follow: false },
    };
  }

  const description = buildDescription(story.shortDescription, story.subtitle);
  const canonicalPath = `/stories/${encodeURIComponent(story.slug)}`;
  const ogImage = story.coverImage || DEFAULT_OG_IMAGE;

  return {
    title: story.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      title: story.title,
      description,
      url: absoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      locale: "fa_IR",
      images: [{ url: ogImage, alt: story.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;

  const [allStories, characters] = await Promise.all([
    readStories(),
    readCharacters(),
  ]);

  const decodedSlug = safeDecode(slug);

  const story =
    allStories.find((item) => item.slug === decodedSlug) ??
    allStories.find((item) => item.slug === slug) ??
    allStories.find((item) => item.id === decodedSlug) ??
    null;

  if (!story) notFound();

  await recordPageView({
    headersList: await headers(),
    targetId: story.id,
    targetType: "story",
  });

  const storyIndex = allStories.findIndex((item) => item.id === story.id);

  const previousStory = storyIndex > 0 ? allStories[storyIndex - 1] : undefined;

  const nextStory =
    storyIndex >= 0 && storyIndex < allStories.length - 1
      ? allStories[storyIndex + 1]
      : undefined;

  const canonicalPath = `/stories/${encodeURIComponent(story.slug)}`;

  const storyDescription = buildDescription(
    story.shortDescription,
    story.subtitle,
  );

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: storyDescription,
    inLanguage: "fa-IR",
    url: absoluteUrl(canonicalPath),
    mainEntityOfPage: absoluteUrl(canonicalPath),
    ...(story.coverImage ? { image: [story.coverImage] } : {}),
    ...(story.createdAt ? { datePublished: story.createdAt } : {}),
    ...(story.updatedAt ? { dateModified: story.updatedAt } : {}),
    author: { "@type": "Person", name: "ابوالقاسم فردوسی" },
    publisher: { "@type": "Organization", name: SITE_NAME },
    isPartOf: { "@type": "CreativeWorkSeries", name: "شاهنامه فردوسی" },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "خانه",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "روایت‌ها",
        item: absoluteUrl("/stories"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: story.title,
        item: absoluteUrl(canonicalPath),
      },
    ],
  };

  return (
    <SiteLayout withHeaderOffset>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <main className="relative min-h-screen overflow-hidden bg-shah-cream-50 pb-24 text-shah-black-950 dark:bg-shah-black-950 dark:text-shah-cream-100">
        <ReadingProgress targetId="story-content" />

        <PageBackground />

        <StoryHero story={story} />

        <div
          id="story-content"
          className="relative z-10 mx-auto max-w-5xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
        >
          <div className="relative -mt-10 mb-10 md:-mt-14">
            <div className="rounded-[1.75rem] border border-shah-gold-500/14 bg-white/82 p-5 shadow-xl shadow-shah-black-900/7 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5.5 md:p-7">
              <Intro story={story} />
            </div>
          </div>

          <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-black prose-headings:text-zinc-900 dark:prose-headings:text-white prose-p:text-zinc-700 dark:prose-p:text-shah-cream-100/78">
            <MainStory
              characters={characters}
              nextStory={nextStory}
              previousStory={previousStory}
              story={story}
            />
          </article>

          {story.quote ? (
            <div className="my-14">
              <Quote quote={story.quote} />
            </div>
          ) : null}

          <section className="mt-14 border-t border-shah-gold-500/10 pt-10">
            <Characters availableCharacters={characters} story={story} />
          </section>

          <div className="mt-12">
            <StoryEndingNavigation
              nextStory={nextStory}
              previousStory={previousStory}
            />
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}

function PageBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -right-32 top-40 size-120 rounded-full bg-shah-gold-500/7 blur-[130px] dark:bg-shah-gold-500/10" />
      <div className="absolute -left-32 bottom-40 size-112 rounded-full bg-shah-lapis-500/7 blur-[130px] dark:bg-shah-lapis-500/10" />
      <div className="absolute inset-x-0 top-0 h-80 bg-linear-to-b from-white/40 to-transparent dark:from-white/2.5" />
    </div>
  );
}

function Intro({ story }: { story: Story }) {
  return (
    <section dir="rtl">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-shah-gold-500/45" />

          <h2 className="text-xs font-black uppercase tracking-[0.26em] text-shah-gold-700 dark:text-shah-gold-300">
            درآمد داستان
          </h2>

          <span className="h-px flex-1 bg-linear-to-l from-shah-gold-500/20 to-transparent" />
        </div>

        <div className="relative">
          <div className="absolute right-0 top-1 h-[calc(100%-0.5rem)] w-px bg-linear-to-b from-shah-gold-500/35 via-shah-gold-500/10 to-transparent" />

          <p className="pr-5 text-right text-base font-bold leading-9 text-zinc-700 dark:text-shah-cream-100/74 md:text-lg md:leading-10">
            {story.shortDescription}
          </p>
        </div>
      </div>
    </section>
  );
}

function MainStory({
  characters,
  nextStory,
  previousStory,
  story,
}: {
  characters: Character[];
  nextStory?: Story;
  previousStory?: Story;
  story: Story;
}) {
  const tocItems = story.sections.map((section) => ({
    id: getStorySectionAnchor(section.id),
    title: section.title,
  }));

  const characterLinks = toStoryCharacterLinkData(characters);

  return (
    <section className="space-y-10" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-shah-gold-500/50" />

          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
            روایت اصلی
          </h2>
        </div>

        <div className="hidden h-px flex-1 bg-linear-to-l from-zinc-200 to-transparent dark:from-white/10 md:block" />

        <StoryReadingMode
          characters={characterLinks}
          nextStory={nextStory}
          previousStory={previousStory}
          story={story}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-28">
          <StoryToc items={tocItems} />
        </aside>

        <div className="min-w-0">
          {story.content ? (
            <StoryRichText
              characters={characterLinks}
              html={story.content}
              className="character-story text-right text-base leading-9 text-shah-black-800 dark:text-zinc-200/88 md:text-lg md:leading-10"
            />
          ) : null}

          {story.sections.length ? (
            <div className="mt-8 space-y-8">
              {story.sections.map((section, index) => (
                <StorySection
                  key={section.id}
                  anchorId={getStorySectionAnchor(section.id)}
                  characters={characterLinks}
                  section={section}
                  index={index}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Characters({
  availableCharacters,
  story,
}: {
  availableCharacters: Character[];
  story: Story;
}) {
  if (!story.characters.length) return null;

  const charactersBySlug = new Map(
    availableCharacters.map((character) => [character.slug, character]),
  );

  return (
    <section className="relative rounded-[1.75rem] border border-shah-gold-500/14 bg-white/76 p-4 shadow-xl shadow-shah-black-900/6 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 md:p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-shah-gold-700 dark:text-shah-gold-300">
            Characters
          </p>

          <h2 className="mt-2 text-xl font-black tracking-tight text-zinc-900 dark:text-white">
            نقش‌آفرینان این روایت
          </h2>

          <p className="mt-1 text-xs font-bold leading-6 text-shah-black-500 dark:text-zinc-400">
            شخصیت‌هایی که در این بخش از روایت حضور دارند.
          </p>
        </div>

        <span className="inline-flex w-fit rounded-full border border-shah-gold-500/14 bg-shah-gold-500/8 px-3 py-1 text-[11px] font-black text-shah-gold-800 dark:text-shah-gold-200">
          {story.characters.length} شخصیت
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {story.characters.map((reference) => {
          const character = charactersBySlug.get(reference.slug);
          const image =
            character?.portraitImage?.trim() || character?.sceneImage?.trim();

          return (
            <Link
              key={reference.slug}
              href={`/characters/${encodeURIComponent(reference.slug)}`}
              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-shah-gold-500/12 bg-white/66 p-3 text-right shadow-lg shadow-shah-black-900/4 transition hover:-translate-y-0.5 hover:border-shah-gold-500/30 hover:bg-white dark:border-white/10 dark:bg-white/4 dark:hover:bg-white/[0.07]"
            >
              <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-shah-gold-500/14 bg-shah-lapis-900 text-sm font-black text-shah-gold-100">
                {image ? (
                  <Image
                    src={image}
                    alt={reference.name}
                    fill
                    sizes="48px"
                    className="object-cover transition duration-500 group-hover:scale-110"
                    unoptimized={shouldUseUnoptimizedImage(image)}
                  />
                ) : (
                  reference.name.slice(0, 1)
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-shah-black-950 transition group-hover:text-shah-gold-700 dark:text-white dark:group-hover:text-shah-gold-300">
                  {reference.name}
                </span>

                <span className="mt-0.5 block truncate text-[11px] font-bold text-shah-black-500 dark:text-zinc-400">
                  {character?.title || character?.role || "نقش‌آفرین روایت"}
                </span>
              </span>

              <span className="shrink-0 rounded-full border border-shah-gold-500/14 bg-shah-gold-500/8 px-2.5 py-1 text-[10px] font-black text-shah-gold-800 opacity-0 transition group-hover:opacity-100 dark:text-shah-gold-200">
                مشاهده
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Quote({ quote }: { quote: string }) {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-shah-gold-500/16 bg-linear-to-br from-shah-gold-50 via-white to-shah-cream-50 p-6 text-center shadow-xl shadow-shah-black-900/6 dark:from-shah-gold-500/10 dark:via-white/4.5 dark:to-shah-lapis-950/25 md:p-8">
      <span className="absolute right-5 top-0 text-7xl font-black leading-none text-shah-gold-500/10 select-none">
        «
      </span>

      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="mb-4 text-[11px] font-black tracking-[0.28em] text-shah-gold-700 dark:text-shah-gold-300">
          بیت برگزیده
        </p>

        <blockquote
          className="quote-poem text-lg font-black italic leading-10 text-shah-lapis-950 dark:text-shah-gold-100 md:text-xl md:leading-[2.2]"
          dangerouslySetInnerHTML={{ __html: quote }}
        />

        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="size-1 rounded-full bg-shah-gold-500" />
          <div className="h-1 w-10 rounded-full bg-shah-gold-500/30" />
          <div className="size-1 rounded-full bg-shah-gold-500" />
        </div>
      </div>

      <span className="absolute bottom-0 left-5 text-7xl font-black leading-none text-shah-gold-500/10 select-none">
        »
      </span>
    </section>
  );
}
