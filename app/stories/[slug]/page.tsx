import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SiteLayout } from "@/components/site-layout";
import { ReadingProgress } from "@/components/reading-progress";
import { StoryEndingNavigation } from "@/components/story-ending-navigation";
import { StoryReadingMode } from "@/components/story-reading-mode";
import { StoryRichText } from "@/components/story-rich-text";
import { StoryHero } from "@/components/story-hero";
import { StorySection } from "@/components/story-section";
import { StoryToc } from "@/components/story-toc";
import { recordPageView } from "@/lib/analytics-store";
import { readCharacters } from "@/lib/character-store";
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

  const description = buildDescription(
    story.shortDescription,
    story.subtitle,
  );
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
      { "@type": "ListItem", position: 1, name: "خانه", item: absoluteUrl("/") },
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
      <main className="relative min-h-screen bg-shah-cream-50 pb-32 dark:bg-shah-black-950">
        <ReadingProgress targetId="story-content" />
        {/* هیرو سکشن: اینجا فرض بر این است که استایل هیرو را هم سنگین و جذاب بسته‌ای */}
        <StoryHero story={story} />

        {/* کانتینر اصلی با عرض کنترل شده برای خوانایی بیشتر متن (مشابه کتاب) */}
        <div
          id="story-content"
          className="relative mx-auto max-w-6xl scroll-mt-28 px-6 lg:px-8"
        >
          {/* ۱. بخش مقدمه (Intro): با استایل نقل‌قول یا چکیده کتاب */}
          <div className="relative -mt-20 z-20 mb-16">
            <div className="rounded-[2.5rem] border border-shah-gold-500/20 bg-card/80 p-8 backdrop-blur-2xl shadow-xl dark:bg-shah-black-900/80 md:p-12">
              <Intro story={story} />
            </div>
          </div>

          {/* ۲. متن اصلی داستان (MainStory): تمرکز روی تایپوگرافی تمیز */}
          <article
            className="prose prose-lg prose-zinc max-w-none dark:prose-invert 
        prose-headings:font-black prose-headings:text-zinc-900 dark:prose-headings:text-white
        prose-p:leading-[2.2] prose-p:text-zinc-700 dark:prose-p:text-shah-cream-100/80
        prose-dropcap:text-6xl prose-dropcap:font-black prose-dropcap:text-shah-gold-500 prose-dropcap:ml-3"
          >
            <MainStory
              characters={characters}
              nextStory={nextStory}
              previousStory={previousStory}
              story={story}
            />
          </article>

          {/* ۳. نقل قول (Quote): استایل کتیبه‌ای وسط متن */}
          {story.quote && (
            <div className="my-20 flex flex-col items-center text-center">
              <div className="mb-6 h-px w-24 bg-linear-to-r from-transparent via-shah-gold-500 to-transparent" />
              <Quote quote={story.quote} />
              <div className="mt-6 h-px w-24 bg-linear-to-r from-transparent via-shah-gold-500 to-transparent" />
            </div>
          )}

          {/* ۴. شخصیت‌ها (Characters): کارت‌های کوچک و دایره‌ای در انتهای روایت */}
          <section className="mt-24 border-t border-shah-gold-500/10 pt-16">
            <Characters availableCharacters={characters} story={story} />
          </section>

          <StoryEndingNavigation
            nextStory={nextStory}
            previousStory={previousStory}
          />
        </div>

        {/* المان‌های تزئینی جانبی (فیکس شده در دو طرف صفحه در دسکتاپ) */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-shah-gold-500/5 blur-[120px]" />
          <div className="absolute -left-20 bottom-1/4 h-96 w-96 rounded-full bg-shah-lapis-500/5 blur-[120px]" />
        </div>
      </main>
    </SiteLayout>
  );
}

function Intro({ story }: { story: Story }) {
  return (
    <section className="relative z-20" dir="rtl">
      <div className="mx-auto max-w-4xl">
        {/* هدر */}
        <div className="mb-8 flex items-center gap-4">
          <span className="h-px w-10 bg-shah-gold-500/50" />

          <h2
            className="
              text-lg font-black uppercase tracking-[0.35em]
              text-shah-gold-600 dark:text-shah-gold-400
            "
          >
            درآمد داستان
          </h2>

          <span className="h-px flex-1 bg-linear-to-l from-shah-gold-500/30 to-transparent" />
        </div>

        {/* متن */}
        <div className="relative">
          {/* خط تزئینی خیلی subtle */}
          <div className="absolute right-0 top-1 h-[85%] w-px bg-linear-to-b from-shah-gold-500/40 via-shah-gold-500/10 to-transparent" />

          <p
            className="
              pr-6
              text-right text-[1.35rem] md:text-[1.6rem]
              font-medium leading-[2.3]
              text-zinc-700
              md:leading-[2.4]
              dark:text-shah-cream-100/75
            "
          >
            {story.shortDescription}
          </p>
        </div>

        {/* خط پایین خیلی نرم */}
        <div className="mt-8 h-px w-full bg-linear-to-l from-transparent via-shah-gold-500/20 to-transparent" />
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
    <section className="space-y-14" dir="rtl">
      {/* هدر */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <span className="h-px w-10 bg-shah-gold-500/50" />

          <h2 className="text-3xl font-black text-zinc-900 dark:text-white">
            روایت اصلی
          </h2>
        </div>

        <div className="hidden h-px flex-1 bg-linear-to-l from-zinc-200 to-transparent md:block dark:from-white/10" />

        <StoryReadingMode
          characters={characterLinks}
          nextStory={nextStory}
          previousStory={previousStory}
          story={story}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-28">
          <StoryToc items={tocItems} />
        </aside>

        <div className="min-w-0">
          {story.content && (
            <StoryRichText
              characters={characterLinks}
              html={story.content}
              className="
                character-story text-right text-xl leading-loose
                text-shah-black-800 dark:text-zinc-200/90
              "
            />
          )}

          <div className="space-y-10">
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
    <section className="relative overflow-hidden rounded-4xl border border-shah-gold-500/18 bg-white/78 p-5 shadow-[0_24px_70px_rgba(26,26,26,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5.5 dark:shadow-black/30 md:p-8">
      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-shah-gold-500/10 blur-3xl" />

      <div className="relative mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white md:text-3xl">
            نقش‌آفرینان این روایت
          </h2>

          <p className="mt-2 text-sm font-semibold leading-7 text-shah-black-500 dark:text-zinc-400">
            شخصیت‌هایی که در این بخش از روایت حضور دارند.
          </p>
        </div>
      </div>

      <div className="relative flex snap-x gap-4 overflow-x-auto p-2 [scrollbar-width:thin]">
        {story.characters.map((reference) => {
          const character = charactersBySlug.get(reference.slug);
          const image =
            character?.portraitImage?.trim() || character?.sceneImage?.trim();

          return (
            <Link
              key={reference.slug}
              href={`/characters/${encodeURIComponent(reference.slug)}`}
              className="group relative flex min-w-60 snap-start items-center gap-3 rounded-[1.35rem] border border-shah-gold-500/14 bg-white/86 p-3.5 text-right shadow-[0_14px_38px_rgba(26,26,26,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-shah-gold-500/42 hover:bg-white hover:shadow-[0_22px_55px_rgba(212,175,55,0.12)] dark:border-white/10 dark:bg-black/22 dark:hover:bg-white/7.5"
            >
              <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-shah-gold-500/18 bg-shah-lapis-900 text-lg font-black text-shah-gold-100 shadow-inner">
                {image ? (
                  <Image
                    src={image}
                    alt={reference.name}
                    fill
                    sizes="64px"
                    className="object-cover transition duration-500 group-hover:scale-110"
                    unoptimized={image.startsWith("/uploads/")}
                  />
                ) : (
                  reference.name.slice(0, 1)
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-black text-shah-black-950 transition group-hover:text-shah-gold-700 dark:text-white dark:group-hover:text-shah-gold-300">
                  {reference.name}
                </span>

                <span className="mt-1 block truncate text-xs font-bold text-shah-black-500 dark:text-zinc-400">
                  {character?.title || character?.role || "نقش‌آفرین روایت"}
                </span>

                <span className="mt-2 inline-flex rounded-full border border-shah-gold-500/18 bg-shah-gold-500/8 px-2.5 py-0.5 text-[10px] font-black text-shah-gold-800 dark:text-shah-gold-200">
                  مشاهده شخصیت
                </span>
              </span>

              <span className="pointer-events-none absolute bottom-[calc(100%+0.75rem)] right-3 z-30 w-72 translate-y-2 rounded-2xl border border-shah-gold-500/20 bg-white/95 p-4 text-xs font-semibold leading-7 text-shah-black-600 opacity-0 shadow-2xl shadow-black/12 backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-[#101010]/95 dark:text-zinc-300">
                <strong className="mb-1 block text-sm font-black text-shah-black-950 dark:text-white">
                  {reference.name}
                </strong>
                {character?.shortDescription ||
                  character?.role ||
                  `${reference.name} از نقش‌آفرینان این روایت است.`}
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
    <section className="relative my-20 overflow-hidden rounded-4xl border border-shah-gold-500/20 bg-linear-to-br from-shah-gold-50 via-white to-shah-cream-50 p-8 text-center shadow-card dark:from-shah-gold-500/10 dark:via-white/5 dark:to-shah-lapis-950/30 md:p-12">
      <span className="absolute right-6 top-0 text-[8rem] font-black leading-none text-shah-gold-500/10 select-none">
        «
      </span>
      <div className="relative z-10 mx-auto max-w-3xl">
        <p className="mb-6 text-xs font-black tracking-[0.35em] text-shah-gold-700 dark:text-shah-gold-300">
          بیت برگزیده
        </p>
        <blockquote
          className="quote-poem text-2xl font-black italic leading-[2.4] text-shah-lapis-950 dark:text-shah-gold-100 md:text-3xl"
          dangerouslySetInnerHTML={{ __html: quote }}
        />
        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="h-1 w-1 rounded-full bg-shah-gold-500" />
          <div className="h-1 w-12 rounded-full bg-shah-gold-500/30" />
          <div className="h-1 w-1 rounded-full bg-shah-gold-500" />
        </div>
      </div>
      <span className="absolute bottom-0 left-6 text-[8rem] font-black leading-none text-shah-gold-500/10 select-none">
        »
      </span>
    </section>
  );
}
