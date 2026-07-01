import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  FiArrowLeft,
  FiBarChart2,
  FiBookOpen,
  FiEye,
  FiImage,
  FiPlus,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { readAnalyticsSummary } from "@/lib/analytics-store";
import type { DailyViewStat, TopViewedTarget } from "@/lib/analytics-store";
import { readCharacters } from "@/lib/character-store";
import { readStories } from "@/lib/story-store";
import type { Character } from "@/types/character";
import type { Story } from "@/types/story";

export const metadata: Metadata = {
  title: "داشبورد مدیریت",
};

export const dynamic = "force-dynamic";

const toFaNumber = (value: number | string) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export default async function AdminDashboardPage() {
  const [characters, stories, analytics] = await Promise.all([
    readCharacters(),
    readStories(),
    readAnalyticsSummary(),
  ]);
  const withSceneImage = characters.filter((character) => character.sceneImage).length;
  const withCover = stories.filter((story) => story.coverImage).length;
  const recentlyUpdatedCharacters = characters.slice(0, 4);
  const recentStories = stories.slice(0, 4);
  const characterById = new Map(characters.map((character) => [character.id, character]));
  const storyById = new Map(stories.map((story) => [story.id, story]));

  return (
    <>
      <AdminPageHeader
        title="داشبورد کلی"
        description="نمای سریع محتوای سایت، وضعیت رسانه‌ها و دسترسی به کارهای پرکاربرد مدیریت."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FiUsers aria-hidden className="size-6" />}
          label="کل شخصیت‌ها"
          tone="lapis"
          value={characters.length}
        />
        <StatCard
          icon={<FiImage aria-hidden className="size-6" />}
          label="شخصیت‌های دارای صحنه"
          tone="gold"
          value={withSceneImage}
        />
        <StatCard
          icon={<FiBookOpen aria-hidden className="size-6" />}
          label="روایت‌های ثبت‌شده"
          tone="emerald"
          value={stories.length}
        />
        <StatCard
          icon={<FiImage aria-hidden className="size-6" />}
          label="روایت‌های دارای کاور"
          tone="red"
          value={withCover}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FiUsers aria-hidden className="size-6" />}
          label="بازدیدکنندگان یکتا"
          tone="lapis"
          value={analytics.uniqueVisitors}
        />
        <StatCard
          icon={<FiTrendingUp aria-hidden className="size-6" />}
          label="بازدیدکنندگان یکتای امروز"
          tone="emerald"
          value={analytics.todayUniqueVisitors}
        />
        <StatCard
          icon={<FiEye aria-hidden className="size-6" />}
          label="بازدید صفحه‌ها"
          tone="gold"
          value={analytics.totalViews}
        />
        <StatCard
          icon={<FiBarChart2 aria-hidden className="size-6" />}
          label="بازدید امروز"
          tone="red"
          value={analytics.todayViews}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Panel title="روند بازدید صفحه‌ها در ۱۴ روز اخیر">
          <DailyViewsChart items={analytics.dailyViews} />
        </Panel>

        <Panel title="پربازدیدترین‌ها">
          <div className="grid gap-6">
            <TopViewsList
              characterById={characterById}
              items={analytics.topCharacters}
              storyById={storyById}
              title="شخصیت‌ها"
            />
            <TopViewsList
              characterById={characterById}
              items={analytics.topStories}
              storyById={storyById}
              title="روایت‌ها"
            />
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="grid gap-6">
          <Panel
            actionHref="/admin/characters"
            actionLabel="مشاهده همه"
            title="آخرین شخصیت‌ها"
          >
            <div className="grid gap-3">
              {recentlyUpdatedCharacters.length ? (
                recentlyUpdatedCharacters.map((character) => {
                  const image = character.portraitImage || character.sceneImage;

                  return (
                    <Link
                      className="group flex items-center gap-4 rounded-2xl border border-shah-gold-500/12 bg-white/64 p-3 transition hover:-translate-y-0.5 hover:border-shah-gold-500/35 hover:bg-white/90 hover:shadow-lg dark:border-white/8 dark:bg-white/[0.045] dark:hover:bg-white/[0.075]"
                      href={`/admin/characters/${character.id}/edit`}
                      key={character.id}
                    >
                      <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-shah-lapis-800 text-lg font-black text-shah-gold-200">
                        {image ? (
                          <Image
                            src={image}
                            alt={character.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                            unoptimized={image.startsWith("/uploads/")}
                          />
                        ) : (
                          character.name.slice(0, 1)
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-black text-foreground">
                          {character.name}
                        </span>
                        <span className="mt-1 block truncate text-xs font-bold text-muted-foreground">
                          {character.role || character.title || "شخصیت شاهنامه"}
                        </span>
                      </span>
                      <FiArrowLeft className="size-5 text-shah-gold-700 opacity-0 transition group-hover:opacity-100 dark:text-shah-gold-200" />
                    </Link>
                  );
                })
              ) : (
                <EmptyPanelText text="فهرست شخصیت‌ها خالی است." />
              )}
            </div>
          </Panel>

          <Panel
            actionHref="/admin/stories"
            actionLabel="مشاهده همه"
            title="آخرین روایت‌ها"
          >
            <div className="grid gap-3">
              {recentStories.length ? (
                recentStories.map((story) => (
                  <Link
                    className="group flex items-center gap-4 rounded-2xl border border-shah-gold-500/12 bg-white/64 p-3 transition hover:-translate-y-0.5 hover:border-shah-gold-500/35 hover:bg-white/90 hover:shadow-lg dark:border-white/8 dark:bg-white/[0.045] dark:hover:bg-white/[0.075]"
                    href={`/admin/stories/${story.id}/edit`}
                    key={story.id}
                  >
                    <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-shah-lapis-900 text-lg font-black text-shah-gold-200">
                      {story.coverImage ? (
                        <Image
                          src={story.coverImage}
                          alt={story.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized={story.coverImage.startsWith("/uploads/")}
                        />
                      ) : (
                        story.title.slice(0, 1)
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-black text-foreground">
                        {story.title}
                      </span>
                      <span className="mt-1 block truncate text-xs font-bold text-muted-foreground">
                        رتبه زمانی {toFaNumber(story.order)}
                      </span>
                    </span>
                    <FiArrowLeft className="size-5 text-shah-gold-700 opacity-0 transition group-hover:opacity-100 dark:text-shah-gold-200" />
                  </Link>
                ))
              ) : (
                <EmptyPanelText text="هنوز روایتی ثبت نشده است." />
              )}
            </div>
          </Panel>
        </div>

        <aside className="grid content-start gap-6">
          <section className="relative overflow-hidden rounded-[2rem] border border-shah-lapis-700/18 bg-shah-lapis-900 p-6 text-white shadow-2xl shadow-shah-lapis-900/25 dark:border-shah-gold-500/20">
            <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-shah-gold-400/18 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-black tracking-[0.28em] text-shah-gold-300 uppercase">
                Quick Actions
              </p>
              <h2 className="mt-4 text-2xl font-black">اقدام سریع</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-white/72">
                سریع‌ترین مسیر برای افزودن محتوای تازه یا تنظیم محتوای صفحه اصلی.
              </p>
              <div className="mt-6 grid gap-3">
                <QuickAction href="/admin/characters/new" label="ایجاد شخصیت جدید" />
                <QuickAction href="/admin/stories/new" label="ایجاد روایت جدید" />
                <QuickAction href="/admin/settings" label="انتخاب‌های صفحه اصلی" />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-shah-gold-500/16 bg-white/76 p-6 shadow-xl shadow-shah-black-900/6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055]">
            <h2 className="text-lg font-black text-foreground">کیفیت داده‌ها</h2>
            <div className="mt-5 grid gap-4">
              <ProgressRow
                label="پوشش تصویر صحنه شخصیت‌ها"
                total={characters.length}
                value={withSceneImage}
              />
              <ProgressRow
                label="پوشش کاور روایت‌ها"
                total={stories.length}
                value={withCover}
              />
            </div>
          </section>
        </aside>
      </section>
    </>
  );
}

function StatCard({
  icon,
  label,
  tone,
  value,
}: {
  icon: ReactNode;
  label: string;
  tone: "emerald" | "gold" | "lapis" | "red";
  value: number;
}) {
  const toneClasses = {
    emerald: "from-emerald-500/16 text-emerald-700 dark:text-emerald-200",
    gold: "from-shah-gold-500/18 text-shah-gold-800 dark:text-shah-gold-200",
    lapis: "from-shah-lapis-500/16 text-shah-lapis-800 dark:text-blue-200",
    red: "from-red-500/14 text-red-700 dark:text-red-200",
  }[tone];

  return (
    <article className="group relative overflow-hidden rounded-[1.8rem] border border-shah-gold-500/16 bg-white/78 p-5 shadow-xl shadow-shah-black-900/6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-shah-gold-500/34 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.055]">
      <div className={`absolute inset-0 bg-linear-to-br ${toneClasses} to-transparent opacity-70`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground">{label}</p>
          <p className="mt-4 text-4xl font-black text-foreground">
            {toFaNumber(value)}
          </p>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl border border-shah-gold-500/16 bg-white/65 shadow-inner dark:border-white/10 dark:bg-black/18">
          {icon}
        </div>
      </div>
    </article>
  );
}

function Panel({
  actionHref,
  actionLabel,
  children,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[2rem] border border-shah-gold-500/16 bg-white/76 p-5 shadow-xl shadow-shah-black-900/6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-foreground">{title}</h2>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="text-sm font-black text-shah-gold-800 transition hover:text-shah-lapis-800 dark:text-shah-gold-200 dark:hover:text-white"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function DailyViewsChart({ items }: { items: DailyViewStat[] }) {
  const maxValue = Math.max(...items.map((item) => item.views), 1);

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
        <FiBarChart2 aria-hidden className="size-5 text-shah-gold-700" />
        <span>هر ستون تعداد بازدید صفحه‌های عمومی سایت در آن روز است.</span>
      </div>
      <div className="flex h-64 items-end gap-2 overflow-x-auto rounded-2xl border border-shah-gold-500/12 bg-white/50 p-4 dark:border-white/8 dark:bg-black/14">
        {items.map((item) => {
          const height = Math.max((item.views / maxValue) * 100, item.views ? 10 : 3);

          return (
            <div
              key={item.date}
              className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2"
              title={`${formatChartDate(item.date)}: ${toFaNumber(item.views)} بازدید`}
            >
              <span className="text-xs font-black text-foreground">
                {toFaNumber(item.views)}
              </span>
              <span
                className="w-full rounded-t-xl bg-linear-to-t from-shah-lapis-800 to-shah-gold-500 shadow-lg shadow-shah-gold-500/10"
                style={{ height: `${height}%` }}
              />
              <span className="text-[0.65rem] font-bold text-muted-foreground">
                {formatChartDate(item.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopViewsList({
  characterById,
  items,
  storyById,
  title,
}: {
  characterById: Map<string, Character>;
  items: TopViewedTarget[];
  storyById: Map<string, Story>;
  title: string;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-black text-muted-foreground">{title}</h3>
      <div className="grid gap-2">
        {items.length ? (
          items.map((item, index) => {
            const isCharacter = item.targetType === "character";
            const targetTitle = isCharacter
              ? characterById.get(item.targetId)?.name
              : storyById.get(item.targetId)?.title;
            const href = isCharacter
              ? `/admin/characters/${item.targetId}/edit`
              : `/admin/stories/${item.targetId}/edit`;

            return (
              <Link
                key={`${item.targetType}:${item.targetId}`}
                href={href}
                className="flex items-center justify-between gap-3 rounded-2xl border border-shah-gold-500/12 bg-white/55 px-4 py-3 text-sm font-bold transition hover:border-shah-gold-500/35 hover:bg-white/90 dark:border-white/8 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-foreground">
                    {toFaNumber(index + 1)}. {targetTitle ?? "مورد حذف‌شده"}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {isCharacter ? "شخصیت" : "روایت"}
                  </span>
                </span>
                <span className="shrink-0 rounded-xl bg-shah-gold-500/12 px-3 py-1 text-xs font-black text-shah-gold-800 dark:text-shah-gold-100">
                  {toFaNumber(item.views)}
                </span>
              </Link>
            );
          })
        ) : (
          <EmptyPanelText text="هنوز بازدیدی ثبت نشده است." />
        )}
      </div>
    </div>
  );
}

function formatChartDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-12 items-center justify-between rounded-2xl border border-white/12 bg-white/8 px-4 text-sm font-black text-white transition hover:bg-shah-gold-500 hover:text-shah-black-950"
    >
      <span>{label}</span>
      <FiPlus aria-hidden className="size-5" />
    </Link>
  );
}

function ProgressRow({
  label,
  total,
  value,
}: {
  label: string;
  total: number;
  value: number;
}) {
  const percent = total ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm font-bold">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">{toFaNumber(percent)}٪</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-shah-gold-500/12">
        <div
          className="h-full rounded-full bg-linear-to-l from-shah-gold-500 to-shah-lapis-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function EmptyPanelText({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-shah-gold-500/18 bg-white/55 px-4 py-8 text-center text-sm font-bold text-muted-foreground dark:border-white/10 dark:bg-white/[0.035]">
      {text}
    </p>
  );
}
