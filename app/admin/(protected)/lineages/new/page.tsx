import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LineageForm } from "@/components/admin/lineage-form";
import { getCharacterOptions } from "@/lib/character-relations";
import { readCharacters } from "@/lib/character-store";

export const metadata: Metadata = {
  title: "ایجاد تبارنامه",
};

export const dynamic = "force-dynamic";

export default async function NewLineagePage() {
  const characters = await readCharacters();

  return (
    <>
      <AdminPageHeader
        title="ایجاد تبارنامه"
        description="یک lineage بساز، شخصیت‌های عضو را انتخاب کن و وضعیت انتشار را تعیین کن."
      />
      <LineageForm characterOptions={getCharacterOptions(characters)} />
    </>
  );
}
