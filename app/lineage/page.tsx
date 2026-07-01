import type { Metadata } from "next";
import Link from "next/link";

import { LineageSection } from "@/components/lineage-section";
import { SiteLayout } from "@/components/site-layout";
import { PageHeroHeader } from "@/components/page-hero-header";
import { buildApprovedLineageTrees } from "@/lib/character-relations";
import { readCharacters } from "@/lib/character-store";
import { readLineages } from "@/lib/lineage-store";
import { readRelationships } from "@/lib/relationship-store";
import { LineageInfoButton } from "@/components/lineage-info-button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "تبارنامه شاهنامه",
  description:
    "نقشهٔ تعاملی تبارنامه و نسب شخصیت‌های شاهنامه فردوسی؛ پیوندهای خانوادگی، تبارها و نسبت‌های روایی پهلوانان و شاهان را دنبال کنید.",
  path: "/lineage",
});

export const dynamic = "force-dynamic";

type LineagePageProps = {
  searchParams: Promise<{
    character?: string;
  }>;
};

export default async function LineagePage({ searchParams }: LineagePageProps) {
  const [lineages, characters, relationships, params] = await Promise.all([
    readLineages(),
    readCharacters(),
    readRelationships(),
    searchParams,
  ]);

  const approvedLineages = buildApprovedLineageTrees(
    lineages,
    characters,
    relationships,
  );

  return (
    <SiteLayout withHeaderOffset>
      <main className="min-h-screen  px-5 py-24 text-right text-shah-black-900  dark:text-shah-cream-100 md:px-8">
        <section className="mx-auto max-w-7xl">
          <PageHeroHeader
            action={<LineageInfoButton />}
            className="my-20 md:mb-36"
            description="نقشه‌ای تعاملی برای دنبال‌کردن تبارها، پیوندها و نسبت‌های روایی شخصیت‌های شاهنامه."
            eyebrow="Lineage of Persian Legends"
            highlight="شاهنامه"
            title="تبارنامه"
          />

          {approvedLineages.length ? (
            <div className="grid gap-10">
              {approvedLineages.map((lineage) => (
                <LineageSection
                  key={lineage.id}
                  lineage={lineage}
                  currentCharacterId={params.character}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-shah-gold-500/35 bg-white/75 px-6 py-20 text-center shadow-[0_18px_50px_rgba(26,26,26,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5.5">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                هنوز تبارنامه‌ای منتشر نشده است
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm font-bold leading-8 text-shah-black-600 dark:text-zinc-300">
                پس از ساخت و تایید تبارنامه در پنل مدیریت، نقشه تبارها و
                پیوندهای شخصیت‌ها در این صفحه نمایش داده می‌شود.
              </p>

              <Link
                href="/characters"
                className="mt-8 inline-flex rounded-full border border-shah-gold-500/35 px-6 py-3 text-sm font-black text-shah-gold-800 transition hover:-translate-y-0.5 hover:bg-shah-gold-500 hover:text-white hover:shadow-[0_14px_35px_rgba(212,175,55,0.22)] dark:text-shah-gold-200 dark:hover:text-black"
              >
                دیدن شخصیت‌ها
              </Link>
            </div>
          )}
        </section>
      </main>
    </SiteLayout>
  );
}
