import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminField,
  AdminTextarea,
  AdminTextInput,
} from "@/components/admin/admin-form-controls";
import { HomeFeaturedSettings } from "@/components/admin/home-featured-settings";
import { readCharacters } from "@/lib/character-store";
import { readSiteSettings } from "@/lib/site-settings-store";
import { readStories } from "@/lib/story-store";

export const metadata: Metadata = {
  title: "تنظیمات",
};

export default async function SettingsPage() {
  const [characters, stories, settings] = await Promise.all([
    readCharacters(),
    readStories(),
    readSiteSettings(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="تنظیمات"
        description="تنظیمات عمومی پنل و سایت در این بخش قرار می‌گیرد."
      />
      <div className="grid gap-6">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
          <AdminField label="نام سایت">
            <AdminTextInput defaultValue="شاهنامه" />
          </AdminField>
          <AdminField label="توضیح کوتاه">
            <AdminTextarea
              className="min-h-28 resize-y py-3"
              defaultValue="پایگاه داستان‌ها و شخصیت‌های شاهنامه"
            />
          </AdminField>
        </div>

        <HomeFeaturedSettings
          characters={characters}
          initialSettings={settings}
          stories={stories}
        />
      </div>
    </>
  );
}
