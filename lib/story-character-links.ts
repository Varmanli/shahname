import type { Character } from "@/types/character";

export type StoryCharacterLinkData = {
  avatar: string;
  description: string;
  name: string;
  role: string;
  slug: string;
  title: string;
};

export function toStoryCharacterLinkData(
  characters: Character[],
): StoryCharacterLinkData[] {
  return characters.map((character) => ({
    avatar: character.portraitImage || character.sceneImage || "",
    description: character.shortDescription || character.role || "",
    name: character.name,
    role: character.role,
    slug: character.slug,
    title: character.title || character.dynasty || "",
  }));
}

export function linkCharacterNamesInHtml(
  content: string,
  characters: StoryCharacterLinkData[],
) {
  if (!content) return "";

  const candidates = characters
    .filter((character) => character.name.length > 1)
    .sort((a, b) => b.name.length - a.name.length)
    .slice(0, 80);
  const parts = content.split(/(<[^>]+>)/g);

  return parts
    .map((part) => {
      if (part.startsWith("<")) return part;

      let next = part;
      for (const character of candidates) {
        const escapedName = escapeRegExp(character.name);
        next = next.replace(
          new RegExp(`(^|\\s)(${escapedName})(?=\\s|$|[،.؛:!؟])`, "g"),
          `$1<a class="story-character-link cursor-pointer border-b border-dotted border-shah-gold-500/35 px-0.5 text-inherit no-underline decoration-shah-gold-500/35 underline-offset-4 transition hover:border-shah-gold-500/70 hover:bg-shah-gold-500/7" href="/characters/${encodeURIComponent(character.slug)}" data-story-character="${escapeAttribute(character.slug)}">$2</a>`,
        );
      }
      return next;
    })
    .join("");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeAttribute(value: string) {
  return value.replace(/"/g, "&quot;");
}
