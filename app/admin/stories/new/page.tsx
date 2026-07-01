import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoryForm } from "@/components/admin/story-form";
import { readCharacters } from "@/lib/character-store";

export const metadata: Metadata = {
  title: "ایجاد داستان جدید",
};

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const characters = await readCharacters();

  return (
    <>
      <AdminPageHeader
        title="ایجاد داستان جدید"
        description="روایت، بخش‌ها، شخصیت‌ها، رسانه‌ها و جایگاه زمانی داستان را ثبت کنید."
      />
      <StoryForm characters={characters} />
    </>
  );
}
