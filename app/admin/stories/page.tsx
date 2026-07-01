import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoriesList } from "@/components/admin/stories-list";
import { readStories } from "@/lib/story-store";

export const metadata: Metadata = {
  title: "مدیریت داستان‌ها",
};

export const dynamic = "force-dynamic";

export default async function StoriesAdminPage() {
  const stories = await readStories();
  const listVersion = stories
    .map((story) => `${story.id}:${story.updatedAt}`)
    .join("|");

  return (
    <>
      <AdminPageHeader
        title="همه داستان‌ها"
        description="مدیریت، جستجو، ویرایش و حذف داستان‌های شاهنامه."
        actionHref="/admin/stories/new"
        actionLabel="ایجاد داستان جدید"
      />
      <StoriesList key={listVersion} stories={stories} />
    </>
  );
}
