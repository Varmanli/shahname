import Link from "next/link";
import type { Character } from "@/types/character";
import { CharacterCard } from "./character-card";

export function CharactersSection({
  characters,
  limit,
  totalCount,
  viewAllHref,
}: {
  characters: Character[];
  limit?: number;
  totalCount?: number;
  viewAllHref?: string;
}) {
  const displayedCharacters = limit ? characters.slice(0, limit) : characters;
  const hasMoreCharacters = limit
    ? (totalCount ?? characters.length) > limit
    : false;

  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-40">
      {/* هدر بازطراحی شده: تمیز، لوکس و متین */}
      <header className="relative mb-40 flex flex-col items-center text-center">
        {/* متن بالای هدر - بسیار ریز و با فاصله حروف زیاد */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.8em] text-shah-gold-600/60">
            The Great Persian Epic
          </span>
        </div>

        <h2 className="text-6xl font-black tracking-tighter text-zinc-900 md:text-8xl dark:text-white">
          ناموران{" "}
          <span className="text-shah-gold-500 drop-shadow-sm">شاهنامه</span>
        </h2>

        {/* خط تزیینی زیر عنوان - ترکیبی از لاجوردی و طلا */}
        <div className="mt-8 flex h-1 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full w-1/3 bg-shah-lapis-500" />
          <div className="h-full w-2/3 bg-shah-gold-500" />
        </div>
      </header>

      {/* گرید متقارن و قدرتمند */}
      {displayedCharacters.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-12 gap-y-24 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCharacters.map((character) => (
            <div key={character.id} className="relative flex justify-center">
              <CharacterCard character={character} />
            </div>
          ))}
        </div>
      ) : null}

      {/* دکمه "تالار کامل" - طراحی مدرن با انیمیشن Border */}
      {hasMoreCharacters && viewAllHref ? (
        <div className="mt-20 flex justify-center">
          <Link
            href={viewAllHref}
            className="group relative inline-flex h-16 items-center justify-center px-16 overflow-hidden rounded-xl bg-shah-lapis-700 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(26,62,141,0.4)] active:scale-95"
          >
            {/* افکت نوری پس‌زمینه (Glow) */}
            <div className="absolute inset-0 bg-linear-to-r from-shah-lapis-800 via-shah-lapis-600 to-shah-lapis-800 opacity-100 transition-all duration-500 group-hover:via-shah-lapis-500" />

            {/* براقیت آنی هنگام هوور (Shine Effect) */}
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />

            {/* محتوای متنی با جزییات تزیینی */}
            <div className="relative z-10 flex items-center gap-4">
              {/* المان لوزی سمت راست */}
              <div className="h-2 w-2 rotate-45 border border-shah-gold-300 opacity-50 transition-all duration-500 group-hover:rotate-180 group-hover:border-shah-gold-400 group-hover:opacity-100" />

              <span className="text-lg font-black tracking-tight text-shah-gold-50 transition-colors duration-500 group-hover:text-white">
                مشاهده تالار کامل
              </span>

              {/* آیکون فلش با استایل اختصاصی */}
              <div className="flex items-center transition-transform duration-500 group-hover:-translate-x-2">
                <svg
                  className="h-5 w-5 text-shah-gold-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 12H5M12 19l-7-7 7-7"
                  />
                </svg>
              </div>

              {/* المان لوزی سمت چپ */}
              <div className="h-2 w-2 rotate-45 border border-shah-gold-300 opacity-50 transition-all duration-500 group-hover:rotate-180 group-hover:border-shah-gold-400 group-hover:opacity-100" />
            </div>

            {/* حاشیه تزیینی بیرونی (Border Glow) */}
            <div className="absolute inset-0 rounded-xl border border-shah-gold-500/20 transition-all duration-500 group-hover:border-shah-gold-400/50 group-hover:inset-1" />

            {/* خط نوری بسیار ظریف پایین دکمه */}
            <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-shah-gold-400 shadow-[0_0_12px_#f6b81f] transition-all duration-500 group-hover:w-1/2" />
          </Link>
        </div>
      ) : null}
      {/* پترن محو پس‌زمینه */}
      <div className="absolute top-0 left-1/2 -z-10 h-full w-px -translate-x-1/2 bg-linear-to-b from-transparent via-shah-gold-500/10 to-transparent" />
    </section>
  );
}
