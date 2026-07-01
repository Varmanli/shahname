import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteLayout } from "@/components/site-layout";
import { readCharacters } from "@/lib/character-store";
import { pageMetadata } from "@/lib/seo";
import { readStories } from "@/lib/story-store";
import type { Character } from "@/types/character";
import type { Story } from "@/types/story";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "جستجو",
    description:
      "جست‌وجو در میان شخصیت‌ها و روایت‌های شاهنامه فردوسی؛ نام پهلوان، عنوان داستان، لقب یا دودمان را وارد کنید.",
    path: "/search",
  }),
  // صفحه جستجو نباید با پارامترهای کوئری ایندکس شود.
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

type SearchType = "all" | "characters" | "stories";

function plainText(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value = "") {
  return plainText(value)
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .trim();
}

function includesQuery(parts: string[], query: string) {
  const haystack = normalize(parts.filter(Boolean).join(" "));
  return haystack.includes(query);
}

function searchCharacters(characters: Character[], query: string) {
  if (!query) return [];

  return characters.filter((character) =>
    includesQuery(
      [
        character.name,
        character.slug,
        character.title,
        character.role,
        character.nationality,
        character.nameMeaning,
        character.dynasty,
        character.shortDescription,
        character.fullDescription,
        character.quote,
        ...character.epithets,
        ...character.enemies,
        ...character.achievements,
      ],
      query,
    ),
  );
}

function searchStories(stories: Story[], query: string) {
  if (!query) return [];

  return stories.filter((story) =>
    includesQuery(
      [
        story.title,
        story.slug,
        story.subtitle,
        story.shortDescription,
        story.content,
        story.quote,
        ...story.characters.map((character) => character.name),
        ...story.characters.map((character) => character.slug),
        ...story.sections.map((section) => section.title),
        ...story.sections.map((section) => section.content),
      ],
      query,
    ),
  );
}

function getSearchType(value?: string): SearchType {
  if (value === "characters" || value === "stories") return value;
  return "all";
}

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = normalize(params.q);
  const displayQuery = params.q?.trim() ?? "";
  const type = getSearchType(params.type);
  const [characters, stories] = await Promise.all([readCharacters(), readStories()]);
  const characterResults =
    type === "all" || type === "characters"
      ? searchCharacters(characters, query)
      : [];
  const storyResults =
    type === "all" || type === "stories" ? searchStories(stories, query) : [];
  const totalResults = characterResults.length + storyResults.length;
  const hasQuery = Boolean(query);

  return (
    <SiteLayout withHeaderOffset>
      <main className="relative min-h-screen overflow-hidden bg-shah-cream-50 pb-28 pt-28 text-right text-shah-black-900 dark:bg-[#080808] dark:text-shah-cream-100">
        <div className="pointer-events-none absolute right-0 top-0 h-120 w-120 rounded-full bg-shah-gold-500/10 blur-[120px] dark:bg-shah-gold-500/8" />
        <div className="pointer-events-none absolute left-0 top-56 h-100 w-100 rounded-full bg-shah-lapis-500/10 blur-[110px]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 lg:px-8">
          <section className="grid gap-8 rounded-[2.5rem] border border-shah-gold-500/20 bg-white/80 p-6 shadow-2xl shadow-shah-black-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/40 md:p-10">
            <header className="grid gap-5 text-center">
              <div className="mx-auto flex items-center gap-4">
                <span className="h-px w-8 bg-shah-gold-500/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-shah-gold-700 dark:text-shah-gold-300">
                  Search the Epic
                </span>
                <span className="h-px w-8 bg-shah-gold-500/50" />
              </div>
              <h1 className="text-5xl font-black tracking-tight text-shah-black-950 dark:text-white md:text-7xl">
                جستجو در شاهنامه
              </h1>
              <p className="mx-auto max-w-2xl text-base font-medium leading-8 text-shah-black-600 dark:text-zinc-300">
                نام شخصیت، عنوان روایت، لقب، دودمان یا بخشی از متن را وارد کنید.
              </p>
            </header>

            <form action="/search" className="grid gap-4" dir="rtl">
              <div className="grid gap-3 rounded-[1.7rem] border border-shah-gold-500/25 bg-shah-cream-50/80 p-3 shadow-inner dark:border-white/10 dark:bg-black/25 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <input
                    type="search"
                    name="q"
                    defaultValue={displayQuery}
                    autoFocus
                    placeholder="مثلا رستم، ضحاک، سیمرغ، کیومرث..."
                    className="h-16 w-full rounded-[1.2rem] border border-transparent bg-white px-5 pl-14 text-lg font-bold text-shah-black-900 outline-none transition placeholder:text-shah-black-400 focus:border-shah-gold-500 focus:ring-2 focus:ring-shah-gold-400 dark:bg-white/8 dark:text-white dark:placeholder:text-zinc-500"
                  />
                  <svg
                    aria-hidden
                    className="absolute left-5 top-1/2 size-6 -translate-y-1/2 text-shah-gold-600 dark:text-shah-gold-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.4}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>

                <button
                  type="submit"
                  className="h-16 rounded-[1.2rem] bg-shah-lapis-800 px-9 text-base font-black text-shah-gold-100 shadow-lg shadow-shah-lapis-900/20 transition hover:bg-shah-lapis-700 hover:text-white active:scale-95"
                >
                  جستجو
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <SearchTypeOption label="همه" value="all" active={type === "all"} />
                <SearchTypeOption
                  label="شخصیت‌ها"
                  value="characters"
                  active={type === "characters"}
                />
                <SearchTypeOption
                  label="روایت‌ها"
                  value="stories"
                  active={type === "stories"}
                />
              </div>
            </form>
          </section>

          <section className="grid gap-8">
            {hasQuery ? (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-shah-gold-500/15 bg-white/70 px-5 py-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                <p className="text-sm font-black text-shah-black-800 dark:text-zinc-100">
                  {toFaNumber(totalResults)} نتیجه برای «{displayQuery}»
                </p>
                <Link
                  href="/search"
                  className="rounded-xl border border-shah-gold-500/30 px-4 py-2 text-sm font-black text-shah-gold-800 transition hover:bg-shah-gold-500 hover:text-white dark:text-shah-gold-200 dark:hover:text-shah-black-950"
                >
                  پاک کردن جستجو
                </Link>
              </div>
            ) : (
              <EmptyState
                title="برای شروع، چیزی جستجو کنید"
                description="نتیجه‌ها بلافاصله در همین صفحه و به تفکیک شخصیت و روایت نمایش داده می‌شوند."
              />
            )}

            {hasQuery && totalResults === 0 ? (
              <EmptyState
                title="نتیجه‌ای پیدا نشد"
                description="عبارت کوتاه‌تر یا نام‌های شناخته‌شده‌تر را امتحان کنید."
              />
            ) : null}

            {characterResults.length ? (
              <ResultSection
                count={characterResults.length}
                title="شخصیت‌ها"
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {characterResults.map((character) => (
                    <CharacterResultCard
                      key={character.id}
                      character={character}
                    />
                  ))}
                </div>
              </ResultSection>
            ) : null}

            {storyResults.length ? (
              <ResultSection count={storyResults.length} title="روایت‌ها">
                <div className="grid gap-4 lg:grid-cols-2">
                  {storyResults.map((story) => (
                    <StoryResultCard key={story.id} story={story} />
                  ))}
                </div>
              </ResultSection>
            ) : null}
          </section>
        </div>
      </main>
    </SiteLayout>
  );
}

function SearchTypeOption({
  active,
  label,
  value,
}: {
  active: boolean;
  label: string;
  value: SearchType;
}) {
  return (
    <label
      className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-black transition ${
        active
          ? "border-shah-gold-500 bg-shah-gold-500 text-shah-black-950"
          : "border-shah-gold-500/25 bg-white/55 text-shah-black-700 hover:border-shah-gold-500 dark:bg-white/5 dark:text-zinc-200"
      }`}
    >
      <input
        className="sr-only"
        type="radio"
        name="type"
        value={value}
        defaultChecked={active}
      />
      {label}
    </label>
  );
}

function ResultSection({
  children,
  count,
  title,
}: {
  children: React.ReactNode;
  count: number;
  title: string;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-shah-black-950 dark:text-white">
          {title}
        </h2>
        <span className="rounded-xl border border-shah-gold-500/20 bg-shah-gold-500/10 px-4 py-2 text-sm font-black text-shah-gold-800 dark:text-shah-gold-100">
          {toFaNumber(count)} نتیجه
        </span>
      </div>
      {children}
    </div>
  );
}

function CharacterResultCard({ character }: { character: Character }) {
  const image = character.portraitImage.trim() || character.sceneImage.trim();

  return (
    <Link
      href={`/characters/${encodeURIComponent(character.slug)}`}
      className="group flex min-h-36 items-center gap-4 overflow-hidden rounded-[1.6rem] border border-shah-gold-500/20 bg-white/80 p-3 shadow-sm transition hover:-translate-y-1 hover:border-shah-gold-500/45 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.06]"
    >
      <span className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-[1.25rem] bg-shah-lapis-900 text-3xl font-black text-shah-gold-300">
        {image ? (
          <Image
            src={image}
            alt={character.name}
            fill
            sizes="112px"
            className="object-cover transition duration-700 group-hover:scale-105"
            unoptimized={image.startsWith("/uploads/")}
          />
        ) : (
          character.name.slice(0, 1)
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xl font-black text-shah-black-950 dark:text-white">
          {character.name}
        </span>
        <span className="mt-1 block truncate text-sm font-bold text-shah-gold-700 dark:text-shah-gold-200">
          {character.title || character.role || "شخصیت شاهنامه"}
        </span>
        <span className="mt-2 line-clamp-2 text-sm font-medium leading-7 text-shah-black-600 dark:text-zinc-300">
          {plainText(character.shortDescription)}
        </span>
      </span>
    </Link>
  );
}

function StoryResultCard({ story }: { story: Story }) {
  const image = story.coverImage.trim() || "/images/ferdosi.png";

  return (
    <Link
      href={`/stories/${encodeURIComponent(story.slug)}`}
      className="group grid overflow-hidden rounded-[1.6rem] border border-shah-gold-500/20 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:border-shah-gold-500/45 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.06] sm:grid-cols-[12rem_1fr]"
    >
      <span className="relative min-h-48 overflow-hidden bg-shah-lapis-900">
        <Image
          src={image}
          alt={story.title}
          fill
          sizes="(min-width: 640px) 192px, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          unoptimized={image.startsWith("/uploads/")}
        />
      </span>
      <span className="grid content-start gap-2 p-5">
        <span className="text-xl font-black leading-8 text-shah-black-950 dark:text-white">
          {story.title}
        </span>
        <span className="text-sm font-bold leading-7 text-shah-gold-700 dark:text-shah-gold-200">
          {story.subtitle}
        </span>
        <span className="line-clamp-3 text-sm font-medium leading-7 text-shah-black-600 dark:text-zinc-300">
          {plainText(story.shortDescription)}
        </span>
      </span>
    </Link>
  );
}

function EmptyState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-shah-gold-500/30 bg-shah-gold-500/8 px-6 py-14 text-center">
      <p className="text-xl font-black text-shah-black-950 dark:text-white">
        {title}
      </p>
      <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-shah-black-600 dark:text-zinc-300">
        {description}
      </p>
    </div>
  );
}
