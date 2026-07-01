import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/types/character";

export function CharacterCard({ character }: { character: Character }) {
  return (
    <Link
      href={`/characters/${encodeURIComponent(character.slug)}`}
      className="group relative mx-auto flex w-full max-w-80 flex-col items-center justify-center px-3 py-6 transition-all duration-500 sm:px-4 lg:max-w-84"
    >
      {/* هاله نوری پشت کارت که در هوور نمایان می‌شود */}
      <div className="absolute inset-0 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-15 bg-shah-gold-400 rounded-full"></div>

      {/* کانتینر تصویر با قاب لوزی */}
      <div className="relative h-68 w-68 sm:h-72 sm:w-72 lg:h-76 lg:w-76">
        {/* لایه تزیینی لوزی پشت تصویر */}
        <div className="absolute inset-0 rotate-45 rounded-[3.5rem] border border-shah-gold-200/50 bg-shah-cream-100/30 transition-all duration-700 group-hover:rotate-90 group-hover:border-shah-gold-500 group-hover:bg-shah-gold-50/50 dark:border-zinc-800 dark:bg-zinc-900/30"></div>

        {/* قاب اصلی تصویر */}
        <div className="absolute inset-4 overflow-hidden rounded-[2.8rem] border-[6px] border-white bg-zinc-100 shadow-2xl transition-all duration-500 group-hover:-translate-y-6 group-hover:rotate-1 group-hover:border-shah-lapis-500/20 dark:border-zinc-800 dark:bg-zinc-800">
          {character.portraitImage ? (
            <Image
              alt={character.name}
              src={character.portraitImage}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-all duration-1000 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-shah-lapis-900 to-zinc-900" />
          )}
          {/* لایه گرادینت داخلی */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
        </div>

        {/* گوشه طلایی تزیینی */}
        <div className="absolute -right-1 -top-1 h-14 w-14 opacity-0 transition-all duration-500 group-hover:right-3 group-hover:top-3 group-hover:opacity-100">
          <div className="h-full w-full border-r-[3px] border-t-[3px] border-shah-gold-500 rounded-tr-2xl"></div>
        </div>
      </div>

      {/* پلاک نام شیشه‌ای (Glassmorphism) */}
      <div className="relative -mt-12 flex flex-col items-center z-30 w-full max-w-60">
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/20 bg-white/40 px-5 py-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] backdrop-blur-xl transition-all duration-500 group-hover:border-shah-gold-400 group-hover:bg-zinc-900/95 dark:bg-zinc-900/50">
          {/* افکت درخشش متحرک داخل پلاک */}
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>

          <h3 className="relative text-center text-2xl font-black tracking-tight text-zinc-950 transition-colors duration-500 group-hover:text-white dark:text-white">
            {character.name}
          </h3>
        </div>

        {/* لقب شخصیت */}
        {character.title && (
          <p className="mt-4 text-[10px] font-black uppercase text-center tracking-[0.3em] text-shah-gold-700 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 -translate-y-3 dark:text-shah-gold-400">
            {character.title}
          </p>
        )}
      </div>
    </Link>
  );
}
