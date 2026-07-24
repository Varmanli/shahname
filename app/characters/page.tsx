import type { Metadata } from "next";

import { CharactersArchive } from "@/components/characters-archive";
import { SiteLayout } from "@/components/site-layout";
import {
  parseArchiveParams,
  searchCharactersArchive,
  type CharacterSort,
} from "@/lib/archive-search";
import { readCharacters } from "@/lib/character-store";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "شخصیت‌های شاهنامه",
  description:
    "پرونده ناموران شاهنامه فردوسی؛ پهلوانان، شاهان و چهره‌های اسطوره‌ای با نقش، تبار، ویژگی‌ها و پیوندهای روایی. شخصیت موردنظر را جست‌وجو و کاوش کنید.",
  path: "/characters",
});

export const dynamic = "force-dynamic";

type CharactersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CharactersPage({
  searchParams,
}: CharactersPageProps) {
  const characters = await readCharacters();
  const params = await searchParams;
  const parsed = parseArchiveParams(params);
  const result = searchCharactersArchive(characters, {
    cursor: parsed.cursor,
    dynasty: parsed.dynasty,
    era: parsed.era,
    nationality: parsed.nationality,
    page: parsed.page,
    role: parsed.role,
    search: parsed.search,
    sort: ["featured", "newest", "alphabetic"].includes(parsed.sort)
      ? (parsed.sort as CharacterSort)
      : "featured",
  });
  const filterOptions = {
    dynasties: uniqueSorted(characters.map((character) => character.dynasty)),
    nationalities: uniqueSorted(
      characters.map((character) => character.nationality),
    ),
  };

  return (
    <SiteLayout withHeaderOffset>
      <CharactersArchive
        filterOptions={filterOptions}
        result={result}
        totalCount={characters.length}
      />
    </SiteLayout>
  );
}

function uniqueSorted(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "fa"));
}
