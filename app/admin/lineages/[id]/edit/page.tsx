import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LineageForm } from "@/components/admin/lineage-form";
import { getCharacterOptions } from "@/lib/character-relations";
import { readCharacters } from "@/lib/character-store";
import { readLineages } from "@/lib/lineage-store";
import { readRelationships } from "@/lib/relationship-store";

type EditLineagePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "ویرایش تبارنامه",
};

export const dynamic = "force-dynamic";

export default async function EditLineagePage({ params }: EditLineagePageProps) {
  const { id } = await params;
  const [lineages, characters, relationships] = await Promise.all([
    readLineages(),
    readCharacters(),
    readRelationships(),
  ]);
  const lineage = lineages.find((item) => item.id === id);

  if (!lineage) {
    notFound();
  }

  return (
    <>
      <AdminPageHeader
        title={`ویرایش ${lineage.title}`}
        description="انتساب شخصیت‌ها، ترتیب نمایش و وضعیت انتشار را تنظیم کن."
      />
      <LineageForm
        lineage={lineage}
        characterOptions={getCharacterOptions(characters)}
        characterIds={characters
          .filter((character) => character.lineageId === lineage.id)
          .map((character) => character.id)}
        relationships={relationships.filter((relationship) => {
          const lineageCharacterIds = new Set(
            characters
              .filter((character) => character.lineageId === lineage.id)
              .map((character) => character.id),
          );
          return (
            lineageCharacterIds.has(relationship.sourceCharacterId) &&
            lineageCharacterIds.has(relationship.targetCharacterId)
          );
        })}
      />
    </>
  );
}
