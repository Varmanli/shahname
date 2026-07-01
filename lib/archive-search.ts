import type { Character } from "@/types/character";
import { calculateStoryReadingTime } from "@/lib/reading-time";
import type { Story } from "@/types/story";

export type ArchiveKind = "characters" | "stories";
export type CharacterSort = "featured" | "newest" | "alphabetic";
export type StorySort = "newest" | "popular" | "reading-time";

export type CharacterArchiveQuery = {
  cursor?: string;
  dynasty?: string[];
  era?: string[];
  nationality?: string[];
  page?: number;
  role?: string[];
  search?: string;
  sort?: CharacterSort;
};

export type StoryArchiveQuery = {
  character?: string[];
  cursor?: string;
  era?: string[];
  length?: string[];
  page?: number;
  search?: string;
  sort?: StorySort;
  theme?: string[];
};

export type SearchMatch = {
  excerpt: string;
  field: string;
  terms: string[];
};

export type ArchiveSearchResult<T> = {
  didYouMean?: string;
  filters: CharacterArchiveQuery | StoryArchiveQuery;
  hasNextPage: boolean;
  items: T[];
  matches: Record<string, SearchMatch | undefined>;
  nextCursor?: string;
  page: number;
  pageSize: number;
  relatedResults: Array<{ href: string; id: string; label: string }>;
  total: number;
  totalPages: number;
};

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
const diacriticsRegex = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const htmlRegex = /<[^>]*>/g;

const eraValues = ["پیشدادیان", "کیانیان", "اساطیری"];
const characterRoleValues = ["پادشاه", "پهلوان", "دشمن", "زن"];
const storyThemeValues = ["جنگ", "تراژدی", "اسطوره‌ای", "عشق"];
const storyLengthValues = ["کوتاه", "متوسط", "بلند"];

function toEnglishDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));
}

export function normalizePersian(value: string) {
  return toEnglishDigits(value)
    .replace(htmlRegex, " ")
    .replace(diacriticsRegex, "")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه")
    .replace(/[أإآ]/g, "ا")
    .replace(/[‌\u200c]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function plainText(value: string) {
  return value.replace(htmlRegex, " ").replace(/\s+/g, " ").trim();
}

export function toFaNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

export function parseArchiveParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
) {
  const get = (key: string) => {
    if (params instanceof URLSearchParams) return params.get(key) ?? "";
    const value = params[key];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };

  const getList = (key: string) =>
    get(key)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const page = Math.max(1, Number.parseInt(toEnglishDigits(get("page")), 10) || 1);

  return {
    character: getList("character"),
    cursor: get("cursor") || undefined,
    dynasty: getList("dynasty"),
    era: getList("era"),
    length: getList("length"),
    nationality: getList("nationality"),
    page,
    role: getList("role"),
    search: get("search").trim(),
    sort: get("sort"),
    theme: getList("theme"),
  };
}

export function inferCharacterEra(character: Character) {
  const haystack = normalizePersian(
    `${character.dynasty} ${character.lineageGroup} ${character.title} ${character.fullDescription}`,
  );
  if (haystack.includes("پیشدادی")) return "پیشدادیان";
  if (haystack.includes("کیانی")) return "کیانیان";
  return "اساطیری";
}

export function inferCharacterRole(character: Character) {
  const haystack = normalizePersian(`${character.role} ${character.title} ${character.name}`);
  if (character.visualRole === "king" || haystack.includes("شاه")) return "پادشاه";
  if (character.visualRole === "queen" || haystack.includes("زن") || haystack.includes("بانو")) {
    return "زن";
  }
  if (haystack.includes("دشمن") || haystack.includes("اهریمن")) return "دشمن";
  return "پهلوان";
}

export function characterTags(character: Character) {
  return [
    ...character.epithets,
    ...character.achievements,
    ...character.enemies,
    ...character.traits.map((trait) => trait.key),
    character.dynasty,
    character.lineageGroup,
    inferCharacterEra(character),
    inferCharacterRole(character),
  ].filter(Boolean);
}

export function inferStoryEra(story: Story) {
  const haystack = normalizePersian(
    `${story.title} ${story.subtitle} ${story.shortDescription} ${story.content} ${story.characters
      .map((item) => item.name)
      .join(" ")}`,
  );
  if (haystack.includes("پیشدادی")) return "پیشدادیان";
  if (haystack.includes("کیانی")) return "کیانیان";
  return "اساطیری";
}

export function inferStoryTheme(story: Story) {
  const haystack = normalizePersian(
    `${story.title} ${story.subtitle} ${story.shortDescription} ${story.content}`,
  );
  if (/(عشق|رودابه|تهمینه|دل|مهر)/.test(haystack)) return "عشق";
  if (/(تراژدی|سوگ|مرگ|کشته|اندوه|سهراب|سیاوش)/.test(haystack)) return "تراژدی";
  if (/(جنگ|نبرد|سپاه|رزم|لشکر)/.test(haystack)) return "جنگ";
  return "اسطوره‌ای";
}

export function storyReadingTime(story: Story) {
  return story.readingTimeMinutes ?? calculateStoryReadingTime(story);
}

export function inferStoryLength(story: Story) {
  const minutes = storyReadingTime(story);
  if (minutes <= 4) return "کوتاه";
  if (minutes <= 10) return "متوسط";
  return "بلند";
}

export function storyTags(story: Story) {
  return [
    inferStoryEra(story),
    inferStoryTheme(story),
    inferStoryLength(story),
    ...story.characters.map((item) => item.name),
    ...story.sections.map((section) => section.title),
  ].filter(Boolean);
}

function levenshtein(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, (_, row) => [row]);
  for (let column = 1; column <= b.length; column += 1) matrix[0][column] = column;

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      matrix[row][column] =
        a[row - 1] === b[column - 1]
          ? matrix[row - 1][column - 1]
          : Math.min(
              matrix[row - 1][column - 1] + 1,
              matrix[row][column - 1] + 1,
              matrix[row - 1][column] + 1,
            );
    }
  }

  return matrix[a.length][b.length];
}

function fuzzyScore(queryTerm: string, targetTerm: string) {
  if (!queryTerm || !targetTerm) return 0;
  if (targetTerm.includes(queryTerm)) return 1;
  const distance = levenshtein(queryTerm, targetTerm);
  const limit = queryTerm.length <= 4 ? 1 : 2;
  return distance <= limit ? 0.55 - distance * 0.12 : 0;
}

function scoreField(queryTerms: string[], value: string, weight: number) {
  const normalizedValue = normalizePersian(value);
  const targetTerms = normalizedValue.split(" ").filter(Boolean);
  let score = 0;
  let matched = 0;

  for (const queryTerm of queryTerms) {
    const best = Math.max(...targetTerms.map((targetTerm) => fuzzyScore(queryTerm, targetTerm)), 0);
    if (best > 0) {
      score += best * weight;
      matched += 1;
    }
  }

  return { matched, score };
}

function findMatch(
  queryTerms: string[],
  fields: Array<{ field: string; value: string; weight: number }>,
) {
  let best: SearchMatch | undefined;
  let bestScore = 0;
  const matchedTerms = new Set<string>();

  for (const field of fields) {
    const result = scoreField(queryTerms, field.value, field.weight);
    if (result.score > bestScore) {
      bestScore = result.score;
      best = {
        excerpt: createExcerpt(field.value, queryTerms),
        field: field.field,
        terms: queryTerms.filter((term) => normalizePersian(field.value).includes(term)),
      };
    }
    if (result.score > 0) {
      queryTerms.forEach((term) => {
        if (normalizePersian(field.value).includes(term)) matchedTerms.add(term);
      });
    }
  }

  if (!best || bestScore <= 0) return { match: undefined, score: 0 };
  return { match: { ...best, terms: Array.from(matchedTerms) }, score: bestScore };
}

function createExcerpt(value: string, queryTerms: string[]) {
  const text = plainText(value);
  const normalized = normalizePersian(text);
  const index = Math.max(
    0,
    ...queryTerms.map((term) => normalized.indexOf(term)).filter((item) => item >= 0),
  );
  const start = Math.max(0, index - 65);
  const excerpt = text.slice(start, start + 180).trim();
  return `${start > 0 ? "..." : ""}${excerpt}${start + 180 < text.length ? "..." : ""}`;
}

function bestSuggestion(query: string, vocabulary: string[]) {
  const normalized = normalizePersian(query);
  if (!normalized || normalized.length < 3) return undefined;
  const lastTerm = normalized.split(" ").at(-1) ?? normalized;
  let best: { distance: number; word: string } | undefined;

  for (const word of vocabulary) {
    const normalizedWord = normalizePersian(word);
    if (!normalizedWord || normalizedWord === lastTerm) continue;
    const distance = levenshtein(lastTerm, normalizedWord);
    if (distance <= 2 && (!best || distance < best.distance)) {
      best = { distance, word };
    }
  }

  return best?.word;
}

function paginate<T>(items: T[], page: number, pageSize: number, cursor?: string) {
  const cursorIndex = cursor ? Number.parseInt(cursor, 10) : NaN;
  const start = Number.isFinite(cursorIndex) ? cursorIndex : (page - 1) * pageSize;
  const paginated = items.slice(start, start + pageSize);
  const nextIndex = start + pageSize;

  return {
    hasNextPage: nextIndex < items.length,
    items: paginated,
    nextCursor: nextIndex < items.length ? String(nextIndex) : undefined,
    page: Math.floor(start / pageSize) + 1,
  };
}

export function searchCharactersArchive(
  characters: Character[],
  query: CharacterArchiveQuery,
  pageSize = 12,
): ArchiveSearchResult<Character> {
  const search = query.search ?? "";
  const queryTerms = normalizePersian(search).split(" ").filter(Boolean);
  const matches: Record<string, SearchMatch | undefined> = {};
  const charactersById = new Map(characters.map((character) => [character.id, character]));

  let rows = characters
    .map((character) => {
      const tags = characterTags(character);
      const relatedNames = [
        character.father,
        character.mother,
        character.fatherId ? charactersById.get(character.fatherId)?.name : undefined,
        character.motherId ? charactersById.get(character.motherId)?.name : undefined,
        ...character.spouseIds.map((id) => charactersById.get(id)?.name),
        ...character.childrenIds.map((id) => charactersById.get(id)?.name),
        ...character.siblingIds.map((id) => charactersById.get(id)?.name),
        ...character.relations.map((relation) => charactersById.get(relation.targetCharacterId)?.name),
      ].filter(Boolean);
      const fields = [
        { field: "title", value: `${character.name} ${character.title}`, weight: 8 },
        { field: "tags", value: `${tags.join(" ")} ${relatedNames.join(" ")}`, weight: 5 },
        { field: "description", value: character.shortDescription, weight: 3 },
        { field: "content", value: `${character.fullDescription} ${character.quote}`, weight: 1 },
      ];
      const { match, score } = queryTerms.length
        ? findMatch(queryTerms, fields)
        : { match: undefined, score: 0 };
      matches[character.id] = match;
      return { character, score };
    })
    .filter(({ character, score }) => {
      if (queryTerms.length && score <= 0) return false;
      if (query.era?.length && !query.era.includes(inferCharacterEra(character))) return false;
      if (query.role?.length && !query.role.includes(inferCharacterRole(character))) return false;
      if (query.dynasty?.length && !query.dynasty.includes(character.dynasty)) return false;
      if (query.nationality?.length && !query.nationality.includes(character.nationality)) return false;
      return true;
    });

  rows = rows.sort((a, b) => {
    if (queryTerms.length && b.score !== a.score) return b.score - a.score;
    if (query.sort === "newest") {
      return new Date(b.character.createdAt).getTime() - new Date(a.character.createdAt).getTime();
    }
    if (query.sort === "alphabetic") return a.character.name.localeCompare(b.character.name, "fa");
    const bPopularity = b.character.childrenIds.length + b.character.relations.length + b.character.epithets.length;
    const aPopularity = a.character.childrenIds.length + a.character.relations.length + a.character.epithets.length;
    return bPopularity - aPopularity;
  });

  const total = rows.length;
  const page = query.page ?? 1;
  const paginated = paginate(rows.map((row) => row.character), page, pageSize, query.cursor);
  const vocabulary = characters.flatMap((item) => [item.name, item.title, item.role, item.dynasty, ...item.epithets]);

  return {
    didYouMean: total ? undefined : bestSuggestion(search, vocabulary),
    filters: query,
    hasNextPage: paginated.hasNextPage,
    items: paginated.items,
    matches,
    nextCursor: paginated.nextCursor,
    page: paginated.page,
    pageSize,
    relatedResults: rows.slice(0, 4).map(({ character }) => ({
      href: `/characters/${character.slug}`,
      id: character.id,
      label: character.name,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function searchStoriesArchive(
  stories: Story[],
  query: StoryArchiveQuery,
  pageSize = 9,
): ArchiveSearchResult<Story> {
  const search = query.search ?? "";
  const queryTerms = normalizePersian(search).split(" ").filter(Boolean);
  const matches: Record<string, SearchMatch | undefined> = {};

  let rows = stories
    .map((story) => {
      const fields = [
        { field: "title", value: story.title, weight: 8 },
        { field: "tags", value: storyTags(story).join(" "), weight: 5 },
        { field: "description", value: `${story.subtitle} ${story.shortDescription}`, weight: 3 },
        {
          field: "content",
          value: `${story.content} ${story.sections.map((section) => `${section.title} ${section.content}`).join(" ")}`,
          weight: 1,
        },
      ];
      const { match, score } = queryTerms.length
        ? findMatch(queryTerms, fields)
        : { match: undefined, score: 0 };
      matches[story.id] = match;
      return { score, story };
    })
    .filter(({ score, story }) => {
      if (queryTerms.length && score <= 0) return false;
      if (query.era?.length && !query.era.includes(inferStoryEra(story))) return false;
      if (query.theme?.length && !query.theme.includes(inferStoryTheme(story))) return false;
      if (query.length?.length && !query.length.includes(inferStoryLength(story))) return false;
      if (
        query.character?.length &&
        !story.characters.some((character) => query.character?.includes(character.slug))
      ) {
        return false;
      }
      return true;
    });

  rows = rows.sort((a, b) => {
    if (queryTerms.length && b.score !== a.score) return b.score - a.score;
    if (query.sort === "reading-time") return storyReadingTime(a.story) - storyReadingTime(b.story);
    if (query.sort === "popular") return b.story.characters.length - a.story.characters.length || a.story.order - b.story.order;
    return new Date(b.story.createdAt).getTime() - new Date(a.story.createdAt).getTime();
  });

  const total = rows.length;
  const page = query.page ?? 1;
  const paginated = paginate(rows.map((row) => row.story), page, pageSize, query.cursor);
  const vocabulary = stories.flatMap((item) => [
    item.title,
    item.subtitle,
    ...item.characters.map((character) => character.name),
    ...item.sections.map((section) => section.title),
  ]);

  return {
    didYouMean: total ? undefined : bestSuggestion(search, vocabulary),
    filters: query,
    hasNextPage: paginated.hasNextPage,
    items: paginated.items,
    matches,
    nextCursor: paginated.nextCursor,
    page: paginated.page,
    pageSize,
    relatedResults: rows.slice(0, 4).map(({ story }) => ({
      href: `/stories/${story.slug}`,
      id: story.id,
      label: story.title,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export const archiveOptions = {
  characterRoles: characterRoleValues,
  eras: eraValues,
  storyLengths: storyLengthValues,
  storyThemes: storyThemeValues,
};
