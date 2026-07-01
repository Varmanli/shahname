import Image from "next/image";
import Link from "next/link";

import type { CharacterSummary } from "@/types/character";

type CharacterMiniCardProps = {
  character: CharacterSummary;
  compact?: boolean;
};

export function CharacterMiniCard({ character, compact }: CharacterMiniCardProps) {
  return (
    <Link
      href={`/characters/${encodeURIComponent(character.slug)}`}
      className="group relative inline-flex min-w-56 items-center gap-3 rounded-[1.5rem] border border-shah-gold-500/25 bg-white/80 p-3 text-right shadow-[0_14px_40px_rgba(26,26,26,0.08)] transition duration-300 hover:-translate-y-1 hover:border-shah-gold-500/55 hover:shadow-[0_22px_55px_rgba(184,134,11,0.16)] dark:border-white/10 dark:bg-white/[0.065] dark:shadow-black/25 dark:hover:border-shah-gold-300/45"
    >
      <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-shah-gold-500/25 bg-shah-cream-100 dark:bg-zinc-900">
        {character.avatar ? (
          <Image
            src={character.avatar}
            alt={character.name}
            fill
            sizes="56px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full place-items-center bg-shah-lapis-900 text-xl font-black text-shah-gold-200">
            {character.name.slice(0, 1)}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-black text-shah-black-900 dark:text-white">
          {character.name}
        </span>
        {!compact && character.shortTitle ? (
          <span className="mt-1 block truncate text-xs font-bold text-shah-gold-700 dark:text-shah-gold-300">
            {character.shortTitle}
          </span>
        ) : null}
        {!compact && character.dynasty ? (
          <span className="mt-1 block truncate text-[11px] font-bold text-shah-black-500 dark:text-zinc-400">
            {character.dynasty}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
