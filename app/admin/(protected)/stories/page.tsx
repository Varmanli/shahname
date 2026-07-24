import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoriesList } from "@/components/admin/stories-list";
import { readStories } from "@/lib/story-store";

export const metadata: Metadata = {
  title: "مدیریت روایت‌ها",
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
        title="همه روایت‌ها"
        description="مدیریت، جستجو، ویرایش و حذف روایت‌ها شاهنامه."
        actionHref="/admin/stories/new"
        actionLabel="ایجاد داستان جدید"
      />
      <StoriesList key={listVersion} stories={stories} />
    </>
  );
}
