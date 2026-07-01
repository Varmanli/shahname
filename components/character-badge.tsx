import Link from "next/link";

import type { StoryCharacterReference } from "@/types/story";

type CharacterBadgeProps = {
  character: StoryCharacterReference;
};

export function CharacterBadge({ character }: CharacterBadgeProps) {
  return (
    <Link
      href={`/characters/${encodeURIComponent(character.slug)}`}
      className="inline-flex min-h-12 items-center justify-center rounded-xl border border-shah-gold-500/35 bg-shah-gold-500/10 px-5 text-sm font-black text-shah-gold-800 transition hover:border-shah-lapis-700 hover:bg-shah-lapis-700 hover:text-white dark:text-shah-gold-100"
    >
      {character.name}
    </Link>
  );
}
