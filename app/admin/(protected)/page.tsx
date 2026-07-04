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

  const withSceneImage = characters.filter(
    (character) => character.sceneImage,
  ).length;
  const withCover = stories.filter((story) => story.coverImage).length;

  const recentlyUpdatedCharacters = characters.slice(0, 4);
  const recentStories = stories.slice(0, 4);

  const characterById = new Map(
    characters.map((character) => [character.id, character]),
  );
  const storyById = new Map(stories.map((story) => [story.id, story]));

  return (
    <div className="grid gap-7">
      <AdminPageHeader
        title="داشبورد کلی"
        description="نمای سریع محتوای سایت، وضعیت رسانه‌ها، آمار بازدید و دسترسی به کارهای پرکاربرد مدیریت."
      />

      <DashboardHero
        charactersCount={characters.length}
        storiesCount={stories.length}
        todayViews={analytics.todayViews}
        uniqueVisitors={analytics.uniqueVisitors}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FiUsers aria-hidden className="size-6" />}
          label="کل شخصیت‌ها"
          helper="شخصیت‌های ثبت‌شده"
          tone="lapis"
          value={characters.length}
        />
        <StatCard
          icon={<FiImage aria-hidden className="size-6" />}
          label="دارای تصویر صحنه"
          helper="پوشش تصویری شخصیت‌ها"
          tone="gold"
          value={withSceneImage}
        />
        <StatCard
          icon={<FiBookOpen aria-hidden className="size-6" />}
          label="روایت‌ها"
          helper="داستان‌های ثبت‌شده"
          tone="emerald"
          value={stories.length}
        />
        <StatCard
          icon={<FiImage aria-hidden className="size-6" />}
          label="دارای کاور"
          helper="پوشش تصویری روایت‌ها"
          tone="red"
          value={withCover}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FiUsers aria-hidden className="size-6" />}
          label="بازدیدکنندگان یکتا"
          helper="مجموع کاربران یکتا"
          tone="lapis"
          value={analytics.uniqueVisitors}
        />
        <StatCard
          icon={<FiTrendingUp aria-hidden className="size-6" />}
          label="یکتای امروز"
          helper="کاربران یکتای امروز"
          tone="emerald"
          value={analytics.todayUniqueVisitors}
        />
        <StatCard
          icon={<FiEye aria-hidden className="size-6" />}
          label="بازدید صفحه‌ها"
          helper="کل page viewها"
          tone="gold"
          value={analytics.totalViews}
        />
        <StatCard
          icon={<FiBarChart2 aria-hidden className="size-6" />}
          label="بازدید امروز"
          helper="بازدید ثبت‌شده امروز"
          tone="red"
          value={analytics.todayViews}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <Panel
          eyebrow="Analytics"
          title="روند بازدید صفحه‌ها"
          description="نمای ۱۴ روز اخیر از بازدیدهای عمومی سایت."
        >
          <DailyViewsChart items={analytics.dailyViews} />
        </Panel>

        <Panel
          eyebrow="Popular"
          title="پربازدیدترین‌ها"
          description="محتواهایی که بیشتر دیده شده‌اند."
        >
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="grid gap-6">
          <Panel
            eyebrow="Characters"
            actionHref="/admin/characters"
            actionLabel="مشاهده همه"
            title="آخرین شخصیت‌ها"
            description="آخرین شخصیت‌هایی که در سایت ثبت یا بروزرسانی شده‌اند."
          >
            <ContentList>
              {recentlyUpdatedCharacters.length ? (
                recentlyUpdatedCharacters.map((character) => {
                  const image = character.portraitImage || character.sceneImage;

                  return (
                    <ContentRow
                      href={`/admin/characters/${character.id}/edit`}
                      image={image}
                      key={character.id}
                      title={character.name}
                      subtitle={
                        character.role || character.title || "شخصیت شاهنامه"
                      }
                    />
                  );
                })
              ) : (
                <EmptyPanelText text="فهرست شخصیت‌ها خالی است." />
              )}
            </ContentList>
          </Panel>

          <Panel
            eyebrow="Stories"
            actionHref="/admin/stories"
            actionLabel="مشاهده همه"
            title="آخرین روایت‌ها"
            description="آخرین روایت‌های ثبت‌شده در بخش محتوایی سایت."
          >
            <ContentList>
              {recentStories.length ? (
                recentStories.map((story) => (
                  <ContentRow
                    href={`/admin/stories/${story.id}/edit`}
                    image={story.coverImage}
                    key={story.id}
                    title={story.title}
                    subtitle={`رتبه زمانی ${toFaNumber(story.order)}`}
                  />
                ))
              ) : (
                <EmptyPanelText text="هنوز روایتی ثبت نشده است." />
              )}
            </ContentList>
          </Panel>
        </div>

        <aside className="grid content-start gap-6">
          <QuickActionsPanel />

          <Panel
            eyebrow="Health"
            title="کیفیت داده‌ها"
            description="وضعیت تکمیل محتوای تصویری در سایت."
          >
            <div className="grid gap-5">
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
          </Panel>
        </aside>
      </section>
    </div>
  );
}

function DashboardHero({
  charactersCount,
  storiesCount,
  todayViews,
  uniqueVisitors,
}: {
  charactersCount: number;
  storiesCount: number;
  todayViews: number;
  uniqueVisitors: number;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-[2.25rem] border border-shah-gold-500/20 bg-shah-lapis-950 px-6 py-7 text-white shadow-2xl shadow-shah-lapis-950/25 md:px-8 md:py-8">
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-shah-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-10 size-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_45%)]" />

      <div className="relative grid gap-7 xl:grid-cols-[1fr_auto] xl:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-black text-shah-gold-200 shadow-lg shadow-black/10 backdrop-blur-xl">
            <span className="size-2 rounded-full bg-shah-gold-300" />
            پنل مدیریت محتوا
          </div>

          <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight md:text-4xl">
            مدیریت سریع‌تر، تمیزتر و حرفه‌ای‌تر محتوای شاهنامه
          </h1>

          <p className="mt-4 max-w-2xl text-sm font-medium leading-8 text-white/70 md:text-base">
            از اینجا می‌توانی وضعیت کلی محتوا، پوشش تصاویر، بازدیدها و آیتم‌های
            مهم سایت را در یک نگاه بررسی کنی.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:w-md">
          <HeroMiniStat label="شخصیت‌ها" value={charactersCount} />
          <HeroMiniStat label="روایت‌ها" value={storiesCount} />
          <HeroMiniStat label="بازدید امروز" value={todayViews} />
          <HeroMiniStat label="بازدیدکننده یکتا" value={uniqueVisitors} />
        </div>
      </div>
    </section>
  );
}

function HeroMiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/10 p-4 shadow-xl shadow-black/10 backdrop-blur-xl">
      <p className="text-xs font-bold text-white/58">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{toFaNumber(value)}</p>
    </div>
  );
}

function StatCard({
  helper,
  icon,
  label,
  tone,
  value,
}: {
  helper: string;
  icon: ReactNode;
  label: string;
  tone: "emerald" | "gold" | "lapis" | "red";
  value: number;
}) {
  const toneClasses = {
    emerald: {
      aura: "bg-emerald-500/18",
      icon: "text-emerald-700 dark:text-emerald-200",
      line: "from-emerald-500 to-emerald-300",
    },
    gold: {
      aura: "bg-shah-gold-500/20",
      icon: "text-shah-gold-800 dark:text-shah-gold-200",
      line: "from-shah-gold-500 to-amber-200",
    },
    lapis: {
      aura: "bg-shah-lapis-500/18",
      icon: "text-shah-lapis-800 dark:text-blue-200",
      line: "from-shah-lapis-700 to-blue-300",
    },
    red: {
      aura: "bg-red-500/16",
      icon: "text-red-700 dark:text-red-200",
      line: "from-red-500 to-rose-300",
    },
  }[tone];

  return (
    <article className="group relative overflow-hidden rounded-[1.7rem] border border-shah-gold-500/14 bg-white/78 p-5 shadow-xl shadow-shah-black-900/6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-shah-gold-500/35 hover:bg-white/92 hover:shadow-2xl dark:border-white/10 dark:bg-white/5.5 dark:hover:bg-white/8">
      <div
        className={`pointer-events-none absolute -left-10 -top-10 size-32 rounded-full ${toneClasses.aura} blur-2xl transition duration-300 group-hover:scale-125`}
      />
      <div className="relative flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-sm font-black text-foreground">{label}</p>
          <p className="mt-1 text-xs font-bold text-muted-foreground">
            {helper}
          </p>
          <p className="mt-5 text-4xl font-black tracking-tight text-foreground">
            {toFaNumber(value)}
          </p>
        </div>

        <div className="grid size-13 shrink-0 place-items-center rounded-2xl border border-shah-gold-500/14 bg-white/70 shadow-inner shadow-white/40 dark:border-white/10 dark:bg-black/18">
          <span className={toneClasses.icon}>{icon}</span>
        </div>
      </div>

      <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-shah-gold-500/10 dark:bg-white/8">
        <div
          className={`h-full w-2/3 rounded-full bg-linear-to-l ${toneClasses.line}`}
        />
      </div>
    </article>
  );
}

function Panel({
  actionHref,
  actionLabel,
  children,
  description,
  eyebrow,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className="rounded-4xl border border-shah-gold-500/14 bg-white/76 p-5 shadow-xl shadow-shah-black-900/6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5.5 md:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-shah-gold-700 dark:text-shah-gold-200">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-xl font-black text-foreground">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm font-bold leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-shah-gold-500/18 bg-shah-gold-500/10 px-4 text-sm font-black text-shah-gold-900 transition hover:-translate-y-0.5 hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-shah-gold-300/15 dark:text-shah-gold-100"
          >
            {actionLabel}
            <FiArrowLeft aria-hidden className="size-4" />
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
      <div className="flex items-center gap-3 rounded-2xl border border-shah-gold-500/12 bg-white/48 px-4 py-3 text-sm font-bold text-muted-foreground dark:border-white/8 dark:bg-black/14">
        <FiBarChart2
          aria-hidden
          className="size-5 shrink-0 text-shah-gold-700 dark:text-shah-gold-200"
        />
        <span>
          هر ستون نشان‌دهنده تعداد بازدید صفحه‌های عمومی سایت در یک روز است.
        </span>
      </div>

      <div className="flex h-72 items-end gap-2 overflow-x-auto rounded-[1.7rem] border border-shah-gold-500/12 bg-linear-to-b from-white/65 to-white/35 p-4 dark:border-white/8 dark:from-white/5.5 dark:to-black/20">
        {items.map((item) => {
          const height = Math.max(
            (item.views / maxValue) * 100,
            item.views ? 12 : 4,
          );

          return (
            <div
              key={item.date}
              className="group flex min-w-11 flex-1 flex-col items-center justify-end gap-2"
              title={`${formatChartDate(item.date)}: ${toFaNumber(item.views)} بازدید`}
            >
              <span className="rounded-full bg-white/80 px-2 py-1 text-[0.68rem] font-black text-foreground opacity-0 shadow-md transition group-hover:opacity-100 dark:bg-white/10">
                {toFaNumber(item.views)}
              </span>

              <span className="relative flex w-full items-end overflow-hidden rounded-t-2xl bg-shah-gold-500/10">
                <span
                  className="block w-full rounded-t-2xl bg-linear-to-t from-shah-lapis-900 via-shah-lapis-700 to-shah-gold-400 shadow-lg shadow-shah-gold-500/10 transition duration-300 group-hover:brightness-110"
                  style={{ height: `${height}%` }}
                />
              </span>

              <span className="whitespace-nowrap text-[0.65rem] font-black text-muted-foreground">
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-muted-foreground">{title}</h3>
        <span className="rounded-full bg-shah-gold-500/10 px-3 py-1 text-[0.7rem] font-black text-shah-gold-800 dark:text-shah-gold-100">
          Top
        </span>
      </div>

      <div className="grid gap-2.5">
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
                className="group flex items-center justify-between gap-3 rounded-2xl border border-shah-gold-500/12 bg-white/55 px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:border-shah-gold-500/35 hover:bg-white/90 hover:shadow-lg dark:border-white/8 dark:bg-white/4 dark:hover:bg-white/7.5"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-shah-lapis-900 text-xs font-black text-shah-gold-200">
                    {toFaNumber(index + 1)}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-foreground">
                      {targetTitle ?? "مورد حذف‌شده"}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {isCharacter ? "شخصیت" : "روایت"}
                    </span>
                  </span>
                </span>

                <span className="shrink-0 rounded-xl bg-shah-gold-500/12 px-3 py-1 text-xs font-black text-shah-gold-800 transition group-hover:bg-shah-gold-500 group-hover:text-shah-black-950 dark:text-shah-gold-100">
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

function ContentList({ children }: { children: ReactNode }) {
  return <div className="grid gap-3">{children}</div>;
}

function ContentRow({
  href,
  image,
  subtitle,
  title,
}: {
  href: string;
  image?: string | null;
  subtitle: string;
  title: string;
}) {
  return (
    <Link
      className="group flex items-center gap-4 rounded-[1.35rem] border border-shah-gold-500/12 bg-white/58 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-shah-gold-500/35 hover:bg-white/92 hover:shadow-xl dark:border-white/8 dark:bg-white/4.5 dark:hover:bg-white/7.5"
      href={href}
    >
      <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-[1.2rem] bg-shah-lapis-900 text-xl font-black text-shah-gold-200 shadow-lg shadow-shah-lapis-950/10">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="64px"
            className="object-cover transition duration-500 group-hover:scale-110"
            unoptimized={image.startsWith("/uploads/")}
          />
        ) : (
          title.slice(0, 1)
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-black text-foreground">
          {title}
        </span>
        <span className="mt-1 block truncate text-xs font-bold text-muted-foreground">
          {subtitle}
        </span>
      </span>

      <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-shah-gold-500/12 bg-shah-gold-500/8 text-shah-gold-800 opacity-0 transition group-hover:opacity-100 dark:text-shah-gold-100">
        <FiArrowLeft aria-hidden className="size-5" />
      </span>
    </Link>
  );
}

function QuickActionsPanel() {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-shah-lapis-700/18 bg-shah-lapis-950 p-6 text-white shadow-2xl shadow-shah-lapis-900/25 dark:border-shah-gold-500/20">
      <div className="pointer-events-none absolute -left-20 -top-20 size-52 rounded-full bg-shah-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-8 size-60 rounded-full bg-blue-500/16 blur-3xl" />

      <div className="relative">
        <h2 className="mt-4 text-2xl font-black">اقدام سریع</h2>

        <p className="mt-3 text-sm font-medium leading-7 text-white/68">
          مسیرهای اصلی مدیریت محتوا را بدون گشتن بین منوها اجرا کن.
        </p>

        <div className="mt-6 grid gap-3">
          <QuickAction href="/admin/characters/new" label="ایجاد شخصیت جدید" />
          <QuickAction href="/admin/stories/new" label="ایجاد روایت جدید" />
          <QuickAction href="/admin/settings" label="تنظیم صفحه اصلی" />
        </div>
      </div>
    </section>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex h-13 items-center justify-between rounded-2xl border border-white/12 bg-white/9 px-4 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-shah-gold-500 hover:text-shah-black-950"
    >
      <span>{label}</span>
      <span className="grid size-8 place-items-center rounded-xl bg-white/10 transition group-hover:bg-shah-black-950/10">
        <FiPlus aria-hidden className="size-5" />
      </span>
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
    <div className="rounded-2xl border border-shah-gold-500/12 bg-white/50 p-4 dark:border-white/8 dark:bg-white/[0.035]">
      <div className="mb-3 flex items-center justify-between gap-4 text-sm font-bold">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-black text-foreground">
          {toFaNumber(percent)}٪
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-shah-gold-500/12 dark:bg-white/8">
        <div
          className="h-full rounded-full bg-linear-to-l from-shah-gold-500 via-amber-300 to-shah-lapis-700 shadow-lg shadow-shah-gold-500/10"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-3 text-xs font-bold text-muted-foreground">
        {toFaNumber(value)} از {toFaNumber(total)} مورد تکمیل شده
      </p>
    </div>
  );
}

function EmptyPanelText({ text }: { text: string }) {
  return (
    <p className="rounded-[1.35rem] border border-dashed border-shah-gold-500/22 bg-white/55 px-4 py-9 text-center text-sm font-bold text-muted-foreground dark:border-white/10 dark:bg-white/[0.035]">
      {text}
    </p>
  );
}

function formatChartDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}
