import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { LineagesList } from "@/components/admin/lineages-list";
import { readCharacters } from "@/lib/character-store";
import { readLineages } from "@/lib/lineage-store";

export const metadata: Metadata = {
  title: "مدیریت تبارنامه‌ها",
};

export const dynamic = "force-dynamic";

export default async function AdminLineagesPage() {
  const [lineages, characters] = await Promise.all([
    readLineages(),
    readCharacters(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="تبارنامه‌ها"
        description="ساخت، ویرایش و انتشار lineageهای قابل نمایش در صفحه عمومی."
        actionHref="/admin/lineages/new"
        actionLabel="ایجاد تبارنامه"
      />
      <LineagesList
        lineages={lineages.map((lineage) => ({
          ...lineage,
          characterCount: characters.filter(
            (character) => character.lineageId === lineage.id,
          ).length,
        }))}
      />
    </>
  );
}
