import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CharacterForm } from "@/components/admin/character-form";

export const metadata: Metadata = {
  title: "ایجاد شخصیت جدید",
};

export default function NewCharacterPage() {
  return (
    <>
      <AdminPageHeader
        title="ایجاد شخصیت جدید"
        description="اطلاعات شخصیت و تصاویر را در فرم زیر وارد کن."
      />
      <CharacterForm />
    </>
  );
}
