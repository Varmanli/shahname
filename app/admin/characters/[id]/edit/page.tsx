import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CharacterForm } from "@/components/admin/character-form";
import { readCharacters } from "@/lib/character-store";

type EditCharacterPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "ویرایش شخصیت",
};

export const dynamic = "force-dynamic";

export default async function EditCharacterPage({
  params,
}: EditCharacterPageProps) {
  const { id } = await params;
  const characters = await readCharacters();
  const character = characters.find((item) => item.id === id);

  if (!character) {
    notFound();
  }

  return (
    <>
      <AdminPageHeader
        title={`ویرایش ${character.name}`}
        description="اطلاعات ثبت‌شده را اصلاح کن و تغییرات را ذخیره کن."
      />
      <CharacterForm character={character} />
    </>
  );
}
