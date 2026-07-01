import { CharacterMiniCard } from "@/components/character-mini-card";
import type { ReactNode } from "react";
import type { CharacterFamilyRelations, CharacterSummary } from "@/types/character";

type CharacterFamilySectionProps = {
  family: CharacterFamilyRelations;
};

export function CharacterFamilySection({ family }: CharacterFamilySectionProps) {
  const hasRelations =
    family.father ||
    family.mother ||
    family.spouses.length ||
    family.children.length ||
    family.siblings.length ||
    family.directLineage.length > 1;

  if (!hasRelations) {
    return (
      <FamilyCard title="تبارنامه شخصیت">
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-shah-gold-500/30 bg-shah-gold-500/8 px-6 py-10 text-center text-sm font-bold text-shah-black-600 dark:text-zinc-300">
          هنوز رابطه تبارنامه‌ای برای این شخصیت ثبت نشده است.
        </div>
      </FamilyCard>
    );
  }

  return (
    <FamilyCard title="تبارنامه شخصیت">
      <div className="mt-8 grid gap-6">
        <RelationRow label="پدر" characters={family.father ? [family.father] : []} />
        <RelationRow label="مادر" characters={family.mother ? [family.mother] : []} />
        <RelationRow label="همسران" characters={family.spouses} />
        <RelationRow label="فرزندان" characters={family.children} />
        <RelationRow label="خواهر/برادرها" characters={family.siblings} />
        {family.directLineage.length > 1 ? (
          <div>
            <h3 className="mb-3 text-sm font-black text-shah-gold-700 dark:text-shah-gold-300">
              مسیر تبار مستقیم
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {family.directLineage.map((character, index) => (
                <span key={character.id} className="inline-flex items-center gap-3">
                  <CharacterMiniCard character={character} compact />
                  {index < family.directLineage.length - 1 ? (
                    <span className="text-xl font-black text-shah-gold-500">←</span>
                  ) : null}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </FamilyCard>
  );
}

function FamilyCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[1.8rem] border border-shah-gold-500/18 bg-white p-7 shadow-[0_18px_60px_rgba(26,26,26,0.08)] dark:border-white/10 dark:bg-shah-black-900">
      <h2 className="text-center text-3xl font-black text-shah-black-900 dark:text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

function RelationRow({
  characters,
  label,
}: {
  characters: CharacterSummary[];
  label: string;
}) {
  if (!characters.length) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-black text-shah-gold-700 dark:text-shah-gold-300">
        {label}
      </h3>
      <div className="flex flex-wrap gap-3">
        {characters.map((character) => (
          <CharacterMiniCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}
