import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CharacterDetailTabs } from "@/components/character-detail-tabs";
import { JsonLd } from "@/components/json-ld";
import type { CharacterDetailTab } from "@/components/character-detail-tabs";
import { CharacterFamilySection } from "@/components/character-family-section";
import { MediaLightboxGallery } from "@/components/media-lightbox-gallery";
import { PortraitLightbox } from "@/components/portrait-lightbox";
import { SiteLayout } from "@/components/site-layout";
import { SmoothScrollLink } from "@/components/smooth-scroll-link";
import { recordPageView } from "@/lib/analytics-store";
import { readCharacters } from "@/lib/character-store";
import { getFamilyRelations } from "@/lib/character-relations";
import { shouldUseUnoptimizedImage } from "@/lib/images";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
  buildDescription,
} from "@/lib/seo";
import { readStories } from "@/lib/story-store";
import { getTraitPreset } from "@/lib/traits";
import type { CharacterTrait, TraitTone } from "@/lib/traits";
import { cn } from "@/lib/utils";
import type { Character, CharacterFamilyRelations } from "@/types/character";
import type { Story } from "@/types/story";

type CharacterPageProps = {
  params: Promise<{ slug: string }>;
};

type MaybeCharacterDetailTab = CharacterDetailTab | null;

export const dynamic = "force-dynamic";

async function getCharacter(slug: string) {
  const characters = await readCharacters();
  const decodedSlug = safeDecode(slug);

  return (
    characters.find((character) => character.slug === decodedSlug) ??
    characters.find((character) => character.slug === slug) ??
    characters.find((character) => character.id === decodedSlug) ??
    characters.find((character) => character.id === slug) ??
    null
  );
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({
  params,
}: CharacterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const character = await getCharacter(slug);

  if (!character) {
    return {
      title: "شخصیت پیدا نشد",
      robots: { index: false, follow: false },
    };
  }

  const description = buildDescription(
    character.shortDescription,
    character.title,
    `${character.name} از ناموران شاهنامه فردوسی`,
  );
  const canonicalPath = `/characters/${encodeURIComponent(character.slug)}`;
  const ogImage =
    character.portraitImage || character.sceneImage || DEFAULT_OG_IMAGE;
  const pageTitle = character.title
    ? `${character.name} | ${character.title}`
    : character.name;

  return {
    title: character.name,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "profile",
      title: pageTitle,
      description,
      url: absoluteUrl(canonicalPath),
      siteName: SITE_NAME,
      locale: "fa_IR",
      images: [{ url: ogImage, alt: character.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { slug } = await params;
  const [characters, stories] = await Promise.all([
    readCharacters(),
    readStories(),
  ]);
  const decodedSlug = safeDecode(slug);
  const character =
    characters.find((item) => item.slug === decodedSlug) ??
    characters.find((item) => item.slug === slug) ??
    characters.find((item) => item.id === decodedSlug) ??
    characters.find((item) => item.id === slug) ??
    null;

  if (!character) notFound();

  await recordPageView({
    headersList: await headers(),
    targetId: character.id,
    targetType: "character",
  });

  const family = getFamilyRelations(character, characters);
  const relatedStories = stories.filter((story) =>
    story.characters.some(
      (reference) =>
        reference.slug === character.slug || reference.name === character.name,
    ),
  );
  const relatedCharacters = characters
    .filter(
      (item) =>
        item.id !== character.id &&
        ((character.dynasty && item.dynasty === character.dynasty) ||
          (character.lineageId && item.lineageId === character.lineageId)),
    )
    .slice(0, 4);

  const tabItems: MaybeCharacterDetailTab[] = [
    character.shortDescription
      ? {
          id: "intro",
          label: "معرفی کوتاه",
          children: <IntroSection character={character} />,
        }
      : null,
    character.fullDescription
      ? {
          id: "story",
          label: "روایت کامل",
          children: (
            <TextCard title="روایت کامل" centeredTitle>
              <article
                id="full-story"
                className="character-story prose max-w-none text-right text-[15px] leading-8 text-shah-black-800 dark:prose-invert dark:text-zinc-200/90 md:text-base md:leading-9"
                dangerouslySetInnerHTML={{
                  __html: character.fullDescription,
                }}
              />
            </TextCard>
          ),
        }
      : null,
    character.traits.length
      ? {
          id: "traits",
          label: "ویژگی‌ها",
          children: <Traits traits={character.traits} />,
        }
      : null,
    character.achievements.length
      ? {
          id: "achievements",
          label: "دستاوردها",
          children: <Achievements achievements={character.achievements} />,
        }
      : null,
    character.quote
      ? {
          id: "quote",
          label: "بیت برگزیده",
          children: <QuoteSection quote={character.quote} />,
        }
      : null,
    {
      id: "lineage",
      label: "تبارنامه",
      children: <CharacterFamilySection family={family} />,
    },
    {
      id: "related-stories",
      label: "روایت‌های مرتبط",
      children: (
        <RelatedStoriesSection character={character} stories={relatedStories} />
      ),
    },
    relatedCharacters.length
      ? {
          id: "related-characters",
          label: "شخصیت‌های مرتبط",
          children: <RelatedCharactersSection characters={relatedCharacters} />,
        }
      : null,
    character.sceneImage || character.portraitImage
      ? {
          id: "media",
          label: "چندرسانه‌ای",
          children: <MediaSection character={character} />,
        }
      : null,
  ];
  const tabs = tabItems.filter(
    (tab): tab is CharacterDetailTab => tab !== null,
  );

  const canonicalPath = `/characters/${encodeURIComponent(character.slug)}`;
  const characterDescription = buildDescription(
    character.shortDescription,
    character.title,
    `${character.name} از ناموران شاهنامه فردوسی`,
  );
  const characterImage = character.portraitImage || character.sceneImage;
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: character.name,
    description: characterDescription,
    url: absoluteUrl(canonicalPath),
    inLanguage: "fa-IR",
    ...(character.title ? { jobTitle: character.title } : {}),
    ...(character.epithets.length ? { alternateName: character.epithets } : {}),
    ...(characterImage ? { image: characterImage } : {}),
    ...(family.father?.name || character.father
      ? {
          parent: {
            "@type": "Person",
            name: family.father?.name || character.father,
          },
        }
      : {}),
    ...(family.children.length
      ? {
          children: family.children.map((child) => ({
            "@type": "Person",
            name: child.name,
          })),
        }
      : {}),
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
        name: "شخصیت‌ها",
        item: absoluteUrl("/characters"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: character.name,
        item: absoluteUrl(canonicalPath),
      },
    ],
  };

  return (
    <SiteLayout>
      <JsonLd data={personJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <main className="min-h-screen overflow-hidden bg-shah-cream-50 text-right text-shah-black-900 dark:bg-[#080808] dark:text-shah-cream-100">
        <Hero character={character} />

        <div
          id="character-content"
          className="relative mx-auto -mt-10 grid max-w-7xl scroll-mt-28 gap-8 px-5 pb-28 lg:grid-cols-[25rem_minmax(0,1fr)] lg:items-start lg:px-8"
          dir="rtl"
        >
          <aside className="z-20 grid w-full content-start gap-8 lg:col-start-1">
            <QuickInfo
              character={character}
              family={family}
              relatedStories={relatedStories}
            />
          </aside>

          <div className="z-20 w-full min-w-0 lg:col-start-2">
            <CharacterDetailTabs tabs={tabs} />
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}

function Hero({ character }: { character: Character }) {
  const heroImage = character.sceneImage || character.portraitImage;

  return (
    <section className="relative h-[110vh] min-h-225 w-full overflow-hidden bg-shah-cream-200 dark:bg-shah-black-950">
      {heroImage ? (
        <Image
          src={heroImage}
          alt={`صحنه ${character.name}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-shah-lapis-200 via-shah-cream-100 to-shah-gold-100 dark:from-shah-lapis-950 dark:via-zinc-950 dark:to-black" />
      )}

      {/* فقط دارک مود */}
      <div className="absolute inset-0 hidden dark:block bg-linear-to-t from-[#080808] via-[#080808]/55 to-black/20" />
      {/* 
      <div className="absolute inset-0 hidden dark:block bg-linear-to-r from-[#080808]/80 via-transparent to-[#080808]/45" /> */}

      {/* <div className="absolute inset-x-0 bottom-0 hidden h-48 dark:block bg-linear-to-t from-[#080808] to-transparent" /> */}

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end justify-start px-6 pb-40 lg:px-8">
        <div className="max-w-4xl text-right">
          <div className="mb-8 flex flex-row-reverse items-center justify-end gap-3 text-sm font-black text-accent dark:text-shah-gold-300">
            <span className="text-primary/80 dark:text-white/80">
              {character.name}
            </span>

            <span className="text-primary/35 dark:text-white/35">/</span>

            <Link
              href="/characters"
              className="text-primary/70 transition hover:text-accent dark:text-white/70 dark:hover:text-white"
            >
              پهلوانان
            </Link>
          </div>

          <h1 className="text-7xl font-black leading-none text-white dark:drop-shadow-2xl md:text-[10rem]">
            {character.name}
          </h1>

          {character.title ? (
            <p className="mt-5 text-4xl font-black text-shah-cream-400 dark:drop-shadow-none md:text-6xl">
              {character.title}
            </p>
          ) : null}

          <p className="mt-6 max-w-2xl text-lg font-bold leading-9 text-zinc-200/85 dark:drop-shadow-none">
            {character.role || "ناموری از جهان شاهنامه"}
            {character.dynasty ? ` از دودمان ${character.dynasty}` : ""}
          </p>

          <div className="mt-8 flex flex-wrap justify-start gap-3">
            {[
              character.role,
              character.nationality,
              character.dynasty,
              ...character.epithets,
            ]
              .filter(Boolean)
              .slice(0, 4)
              .map((item) => (
                <span
                  key={item}
                  className="rounded-xl border border-accent/35 bg-white/55 px-5 py-2 text-xs font-black text-accent-foreground shadow-sm backdrop-blur-md dark:border-shah-gold-400/35 dark:bg-black/25 dark:text-shah-gold-200"
                >
                  {item}
                </span>
              ))}
          </div>

          <SmoothScrollLink
            href="#character-content"
            aria-label={`آشنایی با ${character.name}`}
            className="
    group relative mt-12 inline-flex items-center justify-center
    rounded-full p-px
    transition-all duration-500
    hover:-translate-y-0.5 hover:scale-[1.03]
    active:translate-y-0 active:scale-95
  "
          >
            {/* Border glow */}
            <span
              className="
      absolute inset-0 rounded-full
      bg-linear-to-l from-shah-gold-300/20 via-shah-gold-500/80 to-shah-gold-300/20
      opacity-70 blur-[1px]
      transition-all duration-500
      group-hover:opacity-100 group-hover:blur-[2px]
    "
            />

            {/* Soft outer aura */}
            <span
              className="
      absolute -inset-4 rounded-full
      bg-shah-gold-500/10 blur-2xl
      opacity-0 transition-opacity duration-500
      group-hover:opacity-100
    "
            />

            {/* Button body */}
            <span
              className="
      relative inline-flex items-center gap-3 overflow-hidden rounded-full
      border border-white/10
      bg-shah-black-950/85 px-8 py-4
      text-base font-black text-shah-gold-300
      shadow-[0_18px_50px_rgba(0,0,0,0.35)]
      backdrop-blur-xl
      transition-all duration-500
      group-hover:border-shah-gold-400/40
      group-hover:bg-shah-gold-500
      group-hover:text-shah-black-950
      group-hover:shadow-[0_22px_70px_rgba(234,179,8,0.22)]
    "
            >
              {/* Moving shine */}
              <span
                className="
        pointer-events-none absolute inset-y-0 -right-16 w-12
        rotate-12 bg-white/20 blur-md
        transition-transform duration-700
        group-hover:-translate-x-80
      "
              />

              {/* Text */}
              <span className="relative">
                آشنایی با {character.name}
                <span
                  className="
          absolute -bottom-1 right-0 h-0.5 w-0 rounded-full
          bg-current transition-all duration-500
          group-hover:w-full
        "
                />
              </span>

              {/* Icon */}
              <span
                className="
        relative grid size-7 place-items-center rounded-full
        border border-shah-gold-400/30 bg-shah-gold-400/10
        transition-all duration-500
        group-hover:border-shah-black-950/20
        group-hover:bg-shah-black-950/10
      "
              >
                <svg
                  className="
          transition-all duration-500
          group-hover:translate-y-0.5
          animate-[arrowBounce_2.4s_ease-in-out_infinite]
          group-hover:animate-[arrowBounce_1s_ease-in-out_infinite]
        "
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
    </section>
  );
}

function IntroSection({ character }: { character: Character }) {
  return (
    <TextCard title="معرفی کوتاه">
      <article
        className="character-story relative mt-5 text-right text-[15px] font-medium leading-8 text-shah-black-800 dark:text-zinc-200/90 md:text-base md:leading-9"
        dangerouslySetInnerHTML={{
          __html: character.shortDescription,
        }}
      />

      {/* {character.fullDescription ? (
        <div className="mt-10 flex justify-start">
          <a
            href="#full-story"
            className="rounded-2xl border border-shah-gold-500/35 bg-shah-gold-500/10 px-7 py-3 text-sm font-black text-shah-gold-800 transition hover:bg-shah-gold-500 hover:text-white dark:border-shah-gold-400/40 dark:text-shah-gold-200 dark:hover:text-black"
          >
            بیشتر بخوانید
          </a>
        </div>
      ) : null} */}
    </TextCard>
  );
}

function RelatedStoriesSection({
  character,
  stories,
}: {
  character: Character;
  stories: Story[];
}) {
  return (
    <TextCard title="روایت‌های مرتبط">
      {stories.length ? (
        <div className="mt-6 grid gap-4">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${encodeURIComponent(story.slug)}`}
              className="
    group relative grid overflow-hidden rounded-[1.7rem]
    border border-shah-gold-500/15
    bg-white shadow-[0_18px_60px_-38px_rgba(0,0,0,0.35)]
    transition-all duration-500 ease-out
    hover:-translate-y-1.5 hover:border-shah-gold-500/40
    hover:shadow-[0_28px_80px_-42px_rgba(184,134,11,0.45)]
    dark:border-white/10 dark:bg-shah-black-900
    md:grid-cols-[18rem_1fr]
  "
            >
              {/* تصویر 16:9 */}
              <span className="relative block aspect-video overflow-hidden bg-shah-lapis-900 md:h-full md:min-h-56 md:aspect-auto">
                {story.coverImage ? (
                  <Image
                    src={story.coverImage}
                    alt={story.title}
                    fill
                    sizes="(min-width: 768px) 288px, 100vw"
                    className="
          object-cover transition-transform duration-700 ease-out
          group-hover:scale-[1.05]
        "
                    unoptimized={shouldUseUnoptimizedImage(story.coverImage)}
                  />
                ) : (
                  <span className="grid h-full min-h-56 place-items-center bg-shah-lapis-900 text-5xl font-black text-shah-gold-300">
                    {story.title.slice(0, 1)}
                  </span>
                )}

                <span className="absolute inset-0 bg-linear-to-l from-black/10 via-transparent to-black/20 dark:from-black/25" />
              </span>

              {/* محتوا */}
              <span className="relative flex min-w-0 flex-col justify-center p-5 md:p-6">
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-shah-gold-500/10 px-3 py-1 text-[11px] font-black text-shah-gold-700 dark:text-shah-gold-300">
                  روایت شاهنامه
                </span>

                <span className="text-lg font-black leading-8 text-zinc-900 transition-colors duration-300 group-hover:text-shah-gold-600 dark:text-white md:text-xl md:leading-9">
                  {story.title}
                </span>

                {story.subtitle ? (
                  <span className="mt-2 line-clamp-2 text-xs font-bold leading-6 text-zinc-600 dark:text-zinc-400 md:text-sm md:leading-7">
                    {story.subtitle}
                  </span>
                ) : null}

                <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-[11px] font-black text-zinc-800 transition-all duration-300 group-hover:bg-shah-lapis-700 group-hover:text-white dark:bg-white/10 dark:text-zinc-100">
                  خواندن روایت
                  <svg
                    className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1"
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
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.25rem] border border-dashed border-shah-gold-500/30 bg-shah-gold-500/8 px-5 py-8 text-center">
          <p className="text-sm font-black text-shah-black-900 dark:text-white md:text-base">
            هنوز روایتی برای {character.name} ثبت نشده است.
          </p>
          <p className="mt-2 text-sm font-medium leading-7 text-shah-black-600 dark:text-zinc-300">
            اگر این شخصیت را در فرم روایت‌ها به داستانی اضافه کنید، آن روایت
            اینجا نمایش داده می‌شود.
          </p>
        </div>
      )}
    </TextCard>
  );
}

function RelatedCharactersSection({ characters }: { characters: Character[] }) {
  return (
    <TextCard title="شخصیت‌های مرتبط">
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {characters.map((character) => (
          <Link
            key={character.id}
            href={`/characters/${encodeURIComponent(character.slug)}`}
            className="group flex items-center gap-3 rounded-[1.4rem] border border-shah-gold-500/15 bg-white/70 p-3.5 transition hover:-translate-y-1 hover:border-shah-gold-500/40 dark:border-white/10 dark:bg-black/18"
          >
            <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-shah-lapis-900 text-lg font-black text-shah-gold-200">
              {character.portraitImage ? (
                <Image
                  src={character.portraitImage}
                  alt={character.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized={shouldUseUnoptimizedImage(character.portraitImage)}
                />
              ) : (
                character.name.slice(0, 1)
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-shah-black-900 group-hover:text-shah-gold-700 dark:text-white md:text-base">
                {character.name}
              </span>
              <span className="mt-1 block truncate text-xs font-bold text-muted-foreground">
                {character.title || character.role || character.dynasty}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </TextCard>
  );
}

function QuickInfo({
  character,
  family,
}: {
  character: Character;
  family: CharacterFamilyRelations;
  relatedStories: Story[];
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.35rem] border border-shah-gold-500/25 bg-linear-to-br from-white via-shah-cream-50 to-shah-gold-50/70 p-4 text-right shadow-2xl shadow-shah-black-900/10 backdrop-blur-xl dark:border-shah-gold-400/25 dark:from-white/[0.07] dark:via-[#101010]/95 dark:to-black/70 dark:shadow-black/50">
      <div className="pointer-events-none absolute inset-0 rounded-[2.35rem] ring-1 ring-inset ring-shah-gold-500/10 dark:ring-white/5" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-shah-gold-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-44 w-44 rounded-full bg-shah-lapis-500/15 blur-3xl" />

      {character.portraitImage ? (
        <div className="relative">
          <PortraitLightbox
            src={character.portraitImage}
            alt={`پرتره ${character.name}`}
            className="relative block aspect-square w-full overflow-hidden rounded-[1.8rem] border border-shah-gold-500/30 bg-shah-cream-100 shadow-[0_18px_45px_rgba(26,26,26,0.18)] dark:border-shah-gold-400/30 dark:bg-zinc-950 dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
            imageClassName="object-cover transition-transform duration-700 hover:scale-105"
          />

          <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-white/40 dark:border-white/10" />
          <div className="pointer-events-none absolute inset-x-8 bottom-0 h-16 translate-y-1/2 rounded-full bg-shah-gold-400/15 blur-2xl" />
        </div>
      ) : null}

      <div className="relative px-3 py-7">
        <div className="mx-auto mb-5 h-px w-28 bg-linear-to-r from-transparent via-shah-gold-400/70 to-transparent" />

        <h2 className="text-center text-3xl font-black text-shah-black-900 dark:text-white">
          {character.name}
        </h2>

        {character.title ? (
          <p className="mt-2 text-center text-sm font-bold leading-7 text-shah-gold-700 dark:text-shah-gold-300">
            {character.title}
          </p>
        ) : null}

        <dl className="mt-8 overflow-hidden rounded-3xl border border-shah-gold-500/15 bg-white/55 dark:border-white/8 dark:bg-black/20">
          <InfoRow label="نقش" value={character.role} />
          <InfoRow label="ملیت" value={character.nationality} />
          <InfoRow label="معنای نام" value={character.nameMeaning} />
          <InfoRow label="دودمان" value={character.dynasty} />
          <InfoRow label="پدر" value={character.father} />
          <InfoRow label="مادر" value={character.mother} />
          <InfoRow
            label="دشمنان"
            value={character.enemies.length ? character.enemies.join("، ") : ""}
          />
        </dl>

        <div className="mt-5 rounded-3xl border border-shah-gold-500/15 bg-white/50 p-4 dark:border-white/8 dark:bg-black/20">
          <h3 className="text-sm font-black text-shah-gold-700 dark:text-shah-gold-300">
            پیوندهای نزدیک
          </h3>
          <div className="mt-3 grid gap-2">
            <MiniRelation
              label="پدر"
              value={family.father?.name || character.father}
            />
            <MiniRelation
              label="فرزند"
              value={family.children
                .slice(0, 2)
                .map((item) => item.name)
                .join("، ")}
            />
            <MiniRelation
              label="دشمن"
              value={character.enemies.slice(0, 2).join("، ")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniRelation({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-shah-gold-500/7 px-3 py-2 text-xs font-bold">
      <span className="text-shah-gold-700 dark:text-shah-gold-300">
        {label}
      </span>
      <span className="truncate text-shah-black-800 dark:text-zinc-200">
        {value || "ثبت نشده"}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="group grid grid-cols-[6.5rem_1fr] items-start gap-4 border-b border-shah-gold-500/15 px-4 py-4 last:border-b-0 transition hover:bg-shah-gold-500/4.5 dark:border-white/8 dark:hover:bg-white/[0.035]">
      <dt className="text-right text-sm font-black text-shah-gold-700 dark:text-shah-gold-300">
        {label}
      </dt>

      <dd className="text-right text-sm font-semibold leading-7 text-shah-black-800 dark:text-zinc-200">
        {value}
      </dd>
    </div>
  );
}

const traitToneClasses: Record<
  TraitTone,
  {
    glow: string;
    icon: string;
  }
> = {
  gold: {
    icon: "text-shah-gold-800 border-shah-gold-500/30 bg-shah-gold-500/10 dark:text-shah-gold-300 dark:border-shah-gold-400/30",
    glow: "bg-shah-gold-400/15",
  },
  lapis: {
    icon: "text-shah-lapis-800 border-shah-lapis-500/25 bg-shah-lapis-500/10 dark:text-blue-200 dark:border-blue-300/20 dark:bg-shah-lapis-700/30",
    glow: "bg-blue-400/10",
  },
  red: {
    icon: "text-red-700 border-red-500/25 bg-red-500/10 dark:text-red-200 dark:border-red-300/20",
    glow: "bg-red-500/10",
  },
  emerald: {
    icon: "text-emerald-700 border-emerald-500/25 bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-300/20",
    glow: "bg-emerald-500/10",
  },
  violet: {
    icon: "text-violet-700 border-violet-500/25 bg-violet-500/10 dark:text-violet-200 dark:border-violet-300/20",
    glow: "bg-violet-500/10",
  },
};

function Traits({ traits }: { traits: CharacterTrait[] }) {
  const sortedTraits = [...traits].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.level - a.level;
  });

  return (
    <SideCard title="ویژگی‌ها">
      <div className="mt-5 grid grid-cols-2 gap-3">
        {sortedTraits.map((trait) => {
          const preset = getTraitPreset(trait.key);
          if (!preset) return null;

          const Icon = preset.icon;
          const tone = traitToneClasses[preset.tone];
          const isNegative = preset.category === "negative";

          return (
            <article
              key={trait.key}
              className={cn(
                "group relative isolate overflow-hidden rounded-[1.35rem] border p-3.5 text-center transition-all duration-300",
                "bg-linear-to-br from-white via-shah-cream-50 to-shah-gold-50/60",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_28px_rgba(26,26,26,0.06)] hover:-translate-y-1",
                "dark:from-white/[0.07] dark:via-white/2.5 dark:to-black/30 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
                isNegative
                  ? "hover:border-red-500/45 hover:shadow-[0_18px_45px_rgba(127,29,29,0.16)] dark:hover:border-red-300/50 dark:hover:shadow-[0_18px_45px_rgba(127,29,29,0.25)]"
                  : "hover:border-shah-gold-500/45 hover:shadow-[0_18px_45px_rgba(184,134,11,0.16)] dark:hover:border-shah-gold-300/50 dark:hover:shadow-[0_18px_45px_rgba(184,134,11,0.18)]",
                trait.featured
                  ? cn(
                      "col-span-2 p-4 md:p-5",
                      isNegative
                        ? "border-red-500/35 shadow-[0_0_38px_rgba(127,29,29,0.12)] dark:border-red-300/45 dark:shadow-[0_0_38px_rgba(127,29,29,0.22)]"
                        : "border-shah-gold-500/35 shadow-[0_0_38px_rgba(184,134,11,0.12)] dark:border-shah-gold-300/45 dark:shadow-[0_0_38px_rgba(184,134,11,0.22)]",
                    )
                  : isNegative
                    ? "border-red-500/20 dark:border-red-400/20"
                    : "border-shah-gold-500/20 dark:border-shah-gold-400/20",
              )}
            >
              {/* aura */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100",
                  isNegative
                    ? "bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.2),transparent_55%)]"
                    : "bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.2),transparent_55%)]",
                )}
              />

              {/* featured aura */}
              {trait.featured ? (
                <div
                  className={cn(
                    "shah-aura absolute inset-x-8 top-0 h-24 rounded-full blur-2xl",
                    isNegative ? "bg-red-500/10" : "bg-shah-gold-400/10",
                  )}
                />
              ) : null}

              {/* subtle pattern */}
              <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full border border-shah-gold-500/15 opacity-40 dark:border-white/10" />
              <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full border border-shah-gold-500/10 dark:border-white/5" />

              {trait.featured ? (
                <span
                  className={cn(
                    "absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black backdrop-blur-md",
                    isNegative
                      ? "border-red-500/25 bg-red-500/10 text-red-800 dark:border-red-300/30 dark:text-red-100"
                      : "border-shah-gold-500/25 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/30 dark:text-shah-gold-200",
                  )}
                >
                  شاخص
                </span>
              ) : null}

              <div
                className={cn(
                  "relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border text-2xl",
                  "transition duration-300 group-hover:scale-110",
                  isNegative
                    ? "shadow-[0_0_22px_rgba(239,68,68,0.18)]"
                    : "shadow-[0_0_22px_rgba(184,134,11,0.18)]",
                  tone.icon,
                )}
              >
                <div className="absolute inset-1 rounded-full border border-white/60 dark:border-white/10" />
                <Icon className="relative z-10" />
              </div>

              <h3 className="relative mt-3 text-xs font-black text-shah-black-900 dark:text-zinc-50 md:text-sm">
                {preset.label}
              </h3>

              {trait.featured ? (
                <p className="relative mx-auto mt-2 max-w-xs text-[11px] font-medium leading-6 text-shah-black-600 dark:text-zinc-300 md:text-xs">
                  {preset.description}
                </p>
              ) : null}

              <div className="relative mt-3 flex items-center justify-center gap-2">
                <LevelDots level={trait.level} negative={isNegative} />
              </div>
            </article>
          );
        })}
      </div>
    </SideCard>
  );
}
function LevelDots({
  level,
  negative = false,
}: {
  level: number;
  negative?: boolean;
}) {
  return (
    <div className="relative mt-4 flex justify-center gap-1.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index < level;

        return (
          <span
            key={index}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition",
              active
                ? negative
                  ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.45)] dark:bg-red-300 dark:shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                  : "bg-shah-gold-500 shadow-[0_0_8px_rgba(184,134,11,0.45)] dark:bg-shah-gold-300 dark:shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                : "bg-shah-black-900/15 dark:bg-white/15",
            )}
          />
        );
      })}
    </div>
  );
}

function Achievements({ achievements }: { achievements: string[] }) {
  return (
    <SideCard title="دستاوردها">
      <ul className="mt-5 grid gap-3">
        {achievements.map((achievement) => (
          <li
            key={achievement}
            className="group relative overflow-hidden rounded-[1.35rem] border border-shah-gold-500/20 bg-linear-to-br from-white via-shah-cream-50 to-shah-gold-50/70 px-4 py-3.5 shadow-[0_10px_28px_rgba(26,26,26,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-shah-gold-500/40 hover:shadow-[0_15px_40px_rgba(184,134,11,0.16)] dark:border-shah-gold-400/20 dark:from-white/5 dark:via-black/30 dark:to-black/60 dark:shadow-none dark:hover:border-shah-gold-300/40 dark:hover:shadow-[0_15px_40px_rgba(184,134,11,0.18)]"
          >
            {/* glow */}
            <div className="absolute inset-0 opacity-0 blur-2xl transition group-hover:opacity-100 bg-[radial-gradient(circle_at_20%_0%,rgba(250,204,21,0.2),transparent_55%)]" />

            {/* decorative lines */}
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full border border-shah-gold-500/15 opacity-40 dark:border-white/10 dark:opacity-30" />
            <div className="absolute -left-6 bottom-0 h-16 w-16 rounded-full border border-shah-gold-500/10 dark:border-white/5" />

            <div className="relative flex items-start gap-3">
              {/* diamond icon */}
              <div className="relative mt-1 flex h-6 w-6 items-center justify-center">
                <span className="absolute h-2.5 w-2.5 rotate-45 bg-shah-gold-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                <span className="absolute h-4 w-4 rotate-45 border border-shah-gold-400/30" />
              </div>

              {/* text */}
              <p className="text-right text-sm font-bold leading-7 text-shah-black-800 dark:text-zinc-200">
                {achievement}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SideCard>
  );
}

function QuoteSection({ quote }: { quote: string }) {
  return (
    <section className="relative overflow-hidden rounded-[1.7rem] border border-shah-gold-500/20 bg-linear-to-br from-white via-shah-cream-50 to-shah-gold-50/60 p-5 shadow-xl shadow-shah-black-900/10 dark:border-shah-gold-400/20 dark:from-[#111111] dark:via-[#0d0d0d] dark:to-shah-lapis-950/50 dark:shadow-black/40 md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(184,134,11,0.10),transparent_34%),radial-gradient(circle_at_88%_85%,rgba(26,62,141,0.12),transparent_32%)]" />

      <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
        <div className="h-px flex-1 bg-linear-to-r from-transparent via-shah-gold-500/35 to-transparent" />

        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rotate-45 bg-shah-gold-500 shadow-[0_0_12px_rgba(250,204,21,0.7)]" />
          <h3 className="text-base font-black text-shah-black-900 dark:text-white md:text-lg">
            بیت برگزیده
          </h3>
        </div>

        <div className="h-px flex-1 bg-linear-to-r from-transparent via-shah-gold-500/35 to-transparent" />
      </div>

      <div className="relative z-10 rounded-[1.35rem] border border-shah-gold-500/15 bg-white/55 px-5 py-6 dark:border-white/10 dark:bg-black/20">
        <span className="pointer-events-none absolute -top-4 right-5 text-5xl font-black leading-none text-shah-gold-500/20">
          ”
        </span>

        <div
          className="character-story quote-poem text-center text-base font-black leading-9 text-shah-lapis-950 dark:text-shah-cream-100 md:text-lg"
          dangerouslySetInnerHTML={{ __html: quote }}
        />
      </div>
    </section>
  );
}

function MediaSection({ character }: { character: Character }) {
  const images = [
    character.sceneImage
      ? {
          src: character.sceneImage,
          alt: `صحنه ${character.name}`,
          label: `صحنه ${character.name}`,
        }
      : null,
    character.portraitImage
      ? {
          src: character.portraitImage,
          alt: `پرتره ${character.name}`,
          label: `پرتره ${character.name}`,
        }
      : null,
  ].filter((image): image is { alt: string; label: string; src: string } =>
    Boolean(image),
  );

  if (!images.length) return null;

  return (
    <TextCard title="چندرسانه‌ای">
      <MediaLightboxGallery images={images} />
    </TextCard>
  );
}

function TextCard({
  title,
  children,
  centeredTitle = false,
}: {
  title: string;
  children: ReactNode;
  centeredTitle?: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.7rem] border border-shah-gold-500/20 bg-white/85 p-5 text-right shadow-xl shadow-shah-black-900/8 backdrop-blur-xl dark:bg-[#101010]/90 dark:shadow-black/40 md:p-6">
      <div className="pointer-events-none absolute inset-0 rounded-[1.7rem] ring-1 ring-inset ring-shah-gold-500/10 dark:ring-white/5" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-shah-gold-500/10 blur-3xl dark:bg-shah-gold-500/5" />

      {centeredTitle ? (
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-transparent to-shah-gold-500/30" />
          <SectionTitle>{title}</SectionTitle>
          <div className="h-px flex-1 bg-linear-to-l from-transparent to-shah-gold-500/30" />
        </div>
      ) : (
        <SectionTitle>{title}</SectionTitle>
      )}

      {children}
    </section>
  );
}

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.7rem] border border-shah-gold-500/20 bg-white/85 p-5 text-right shadow-xl shadow-shah-black-900/8 backdrop-blur-xl dark:bg-[#101010]/90 dark:shadow-black/40 md:p-6">
      <SectionTitle>{title}</SectionTitle>
      {children}
    </section>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="relative w-fit border-r-4 border-shah-gold-500 pr-4 text-lg font-black text-shah-black-900 dark:text-white md:text-xl">
      {children}
      <span className="absolute -bottom-2.5 right-0 h-px w-20 bg-linear-to-l from-shah-gold-500/80 to-transparent md:w-24" />
    </h2>
  );
}
