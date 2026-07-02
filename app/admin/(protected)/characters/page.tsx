import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CharactersList } from "@/components/admin/characters-list";
import { readCharacters } from "@/lib/character-store";

export const metadata: Metadata = {
  title: "پنل مدیریت شخصیت‌ها",
};

export const dynamic = "force-dynamic";

export default async function CharactersAdminPage() {
  const initialCharacters = await readCharacters();
  const listVersion = initialCharacters
    .map((character) => `${character.id}:${character.updatedAt}`)
    .join("|");

  return (
    <>
      <AdminPageHeader
        title="همه شخصیت‌ها"
        description="مدیریت، جستجو، ویرایش و حذف شخصیت‌های ثبت‌شده."
        actionHref="/admin/characters/new"
        actionLabel="ایجاد شخصیت جدید"
      />
      <CharactersList key={listVersion} characters={initialCharacters} />
    </>
  );
}
