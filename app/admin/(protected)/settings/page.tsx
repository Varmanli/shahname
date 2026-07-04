import type { Metadata } from "next";
import { FiGlobe, FiMonitor, FiSettings, FiStar } from "react-icons/fi";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminField,
  AdminTextarea,
  AdminTextInput,
} from "@/components/admin/admin-form-controls";
import { HomeFeaturedSettings } from "@/components/admin/home-featured-settings";
import { HomeHeroSlidesSettings } from "@/components/admin/home-hero-slides-settings";
import { readCharacters } from "@/lib/character-store";
import { readHomeHeroSlides } from "@/lib/home-hero-slides-store";
import { readSiteSettings } from "@/lib/site-settings-store";
import { readStories } from "@/lib/story-store";

export const metadata: Metadata = {
  title: "تنظیمات",
};

export default async function SettingsPage() {
  const [characters, stories, settings, heroSlides] = await Promise.all([
    readCharacters(),
    readStories(),
    readSiteSettings(),
    readHomeHeroSlides(),
  ]);

  return (
    <div className="grid gap-5">
      <AdminPageHeader
        title="تنظیمات"
        description="مدیریت تنظیمات عمومی سایت، اطلاعات نمایشی و آیتم‌های ویژه صفحه اصلی."
      />

      <section className="relative overflow-hidden rounded-[1.8rem] border border-shah-gold-500/14 bg-shah-lapis-950 p-5 text-white shadow-xl shadow-shah-lapis-950/20 md:p-6">
        <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-shah-gold-400/18 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-10 size-72 rounded-full bg-blue-500/16 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-shah-gold-200">
              <FiSettings aria-hidden className="size-3.5" />
              Site Settings
            </div>

            <h2 className="mt-3 text-2xl font-black md:text-3xl">
              تنظیمات هویت و نمایش سایت
            </h2>

            <p className="mt-2 max-w-2xl text-xs font-bold leading-6 text-white/62 md:text-sm">
              اطلاعات اصلی سایت و محتوای منتخب صفحه اصلی را از این بخش کنترل کن.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:w-88">
            <SettingsStat label="شخصیت‌ها" value={characters.length} />
            <SettingsStat label="داستان‌ها" value={stories.length} />
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-start">
        <SettingsCard
          icon={<FiGlobe aria-hidden className="size-4" />}
          title="تنظیمات عمومی"
          description="نام سایت و توضیح کوتاه که در بخش‌های مختلف سایت نمایش داده می‌شود."
        >
          <div className="grid gap-4">
            <AdminField label="نام سایت">
              <AdminTextInput defaultValue="شاهنامه" />
            </AdminField>

            <AdminField label="توضیح کوتاه">
              <AdminTextarea
                className="min-h-28 resize-y py-3 text-sm leading-7"
                defaultValue="پایگاه داستان‌ها و شخصیت‌های شاهنامه"
              />
            </AdminField>
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<FiStar aria-hidden className="size-4" />}
          title="آیتم‌های ویژه صفحه اصلی"
          description="شخصیت‌ها و داستان‌هایی که در صفحه اصلی برجسته نمایش داده می‌شوند."
        >
          <HomeFeaturedSettings
            characters={characters}
            initialSettings={settings}
            stories={stories}
          />
        </SettingsCard>
      </div>

      <SettingsCard
        icon={<FiMonitor aria-hidden className="size-4" />}
        title="اسلایدر هدر صفحه اصلی"
        description="اسلایدهای سینمایی صفحه اصلی را با تصویر، متن و دکمه‌ها کنترل کن."
      >
        <HomeHeroSlidesSettings initialSlides={heroSlides} />
      </SettingsCard>
    </div>
  );
}

function SettingsStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-xl">
      <p className="text-[11px] font-bold text-white/48">{label}</p>
      <p className="mt-1 text-lg font-black text-white">
        {value.toLocaleString("fa-IR")}
      </p>
    </div>
  );
}

function SettingsCard({
  children,
  description,
  icon,
  title,
}: {
  children: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <section className="relative overflow-visible rounded-[1.7rem] border border-shah-gold-500/14 bg-white/72 p-4 text-card-foreground shadow-xl shadow-shah-black-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/4.5 md:p-5">
      <div className="pointer-events-none absolute -left-20 -top-24 size-56 rounded-full bg-shah-gold-500/8 blur-3xl" />

      <header className="relative mb-5 flex items-start gap-3 text-right">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-shah-gold-500/14 bg-shah-gold-500/10 text-shah-gold-800 dark:border-shah-gold-300/15 dark:text-shah-gold-200">
          {icon}
        </div>

        <div>
          <h2 className="text-base font-black text-foreground md:text-lg">
            {title}
          </h2>

          <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </header>

      <div className="relative">{children}</div>
    </section>
  );
}
