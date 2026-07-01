import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoryForm } from "@/components/admin/story-form";
import { readCharacters } from "@/lib/character-store";
import { readStories } from "@/lib/story-store";

type EditStoryPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "ویرایش داستان",
};

export const dynamic = "force-dynamic";

export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const { id } = await params;
  const [stories, characters] = await Promise.all([
    readStories(),
    readCharacters(),
  ]);
  const story = stories.find((item) => item.id === id);

  if (!story) notFound();

  return (
    <>
      <AdminPageHeader
        title={`ویرایش ${story.title}`}
        description="اطلاعات داستان، بخش‌ها، شخصیت‌ها و رسانه‌ها را ویرایش کنید."
      />
      <StoryForm story={story} characters={characters} />
    </>
  );
}
