import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { PageHeroHeader } from "@/components/page-hero-header";
import { SiteLayout } from "@/components/site-layout";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "درباره شاهنامه",
  description:
    "آشنایی با شاهنامه فردوسی، اهمیت فرهنگی و سه قلمرو اسطوره‌ای، پهلوانی و تاریخی آن؛ و معرفی شاهنامه‌سرا به‌عنوان تجربه‌ای تعاملی از حماسهٔ ایران.",
  path: "/about",
});

const importanceItems = [
  {
    description:
      "شاهنامه زبان فارسی را در قالبی باشکوه، آهنگین و ماندگار به نسل‌های بعد رساند.",
    icon: "𐎠",
    title: "پاسداشت زبان",
  },
  {
    description:
      "در دل روایت‌ها تصویری از حافظه جمعی، آیین‌ها و جهان‌بینی ایرانی دیده می‌شود.",
    icon: "◆",
    title: "هویت ایرانی",
  },
  {
    description:
      "قهرمانان شاهنامه فقط نیرومند نیستند؛ با داد، خرد، وفاداری و انتخاب‌های دشوار سنجیده می‌شوند.",
    icon: "⚔",
    title: "پهلوانی و خرد",
  },
  {
    description:
      "شاهنامه میان افسانه، تاریخ، سیاست، عشق، سوگ و سرنوشت پلی زنده می‌سازد.",
    icon: "◈",
    title: "روایت بزرگ",
  },
];

const timelineItems = [
  {
    title: "بخش اسطوره‌ای",
    text: "از کیومرث و هوشنگ تا جمشید و ضحاک؛ جایی که جهان، شهریاری و نبرد روشنایی و تاریکی شکل می‌گیرد.",
  },
  {
    title: "بخش پهلوانی",
    text: "جهان زال، رستم، سهراب، سیاوش و کیخسرو؛ قلب تپنده شاهنامه و اوج روایت‌های حماسی.",
  },
  {
    title: "بخش تاریخی",
    text: "نزدیک‌تر به تاریخ و فرمانروایی؛ روایتی از قدرت، فروپاشی، تدبیر و گردش روزگار.",
  },
];

const projectFeatures = [
  "روایت‌های بخش‌بندی‌شده و قابل دنبال‌کردن",
  "پرونده شخصیت‌ها با نقش، تبار و پیوندها",
  "تبارنامه تعاملی با رابطه‌های مستقیم و روایی",
  "جستجو و پیمایش ساده در جهان شاهنامه",
];

const ctaItems = [
  { href: "/stories", label: "مشاهده روایت‌ها" },
  { href: "/characters", label: "ناموران شاهنامه" },
  { href: "/lineage", label: "تبارنامه شاهنامه" },
];

export default function AboutPage() {
  return (
    <SiteLayout withHeaderOffset>
      <main
        dir="rtl"
        className="min-h-screen overflow-hidden text-shah-black-900  dark:text-shah-cream-100"
      >
        <PageHeroHeader
          description="شاهنامه حماسه‌ای جاودان از فرهنگ، هویت و روایتگری ایرانی است؛ جهانی که اسطوره، تاریخ و خرد را به هم پیوند می‌دهد."
          eyebrow="The Great Persian Epic"
          highlight="شاهنامه"
          title="درباره"
        />

        <div className="mx-auto grid w-full max-w-7xl gap-24 px-5 pb-28 md:px-8">
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <PremiumCard>
              <SectionHeader
                eyebrow="What is Shahnameh"
                title="شاهنامه چیست؟"
              />

              <p className="mt-6 text-base font-semibold leading-9 text-shah-black-600 dark:text-zinc-300 md:text-lg">
                شاهنامه، اثر جاودان حکیم ابوالقاسم فردوسی، یکی از ستون‌های بزرگ
                فرهنگ ایرانی است؛ روایتی عظیم از آفرینش، شهریاری، پهلوانی، عشق،
                سوگ، خرد و سرنوشت. این اثر فقط مجموعه‌ای از روایت‌ها نیست؛
                نقشه‌ای از حافظه فرهنگی ایران است.
              </p>

              <p className="mt-5 text-sm font-semibold leading-8 text-shah-black-500 dark:text-zinc-400">
                فردوسی در حدود سی سال، روایت‌های کهن ایران را در زبانی استوار و
                شاعرانه بازآفرید؛ زبانی که هنوز پس از سده‌ها زنده، خواندنی و
                اثرگذار مانده است.
              </p>
            </PremiumCard>

            <div className="relative overflow-hidden rounded-4xl border border-shah-gold-500/20 bg-linear-to-br from-white via-shah-cream-50 to-shah-lapis-50/70 p-8 text-shah-black-950 shadow-[0_28px_90px_rgba(26,26,26,0.10)] dark:border-shah-gold-500/18 dark:from-shah-black-950 dark:via-[#101827] dark:to-[#070707] dark:text-white dark:shadow-[0_28px_90px_rgba(0,0,0,0.28)] md:p-10">
              <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-shah-gold-500/12 blur-3xl dark:bg-shah-gold-400/15" />
              <div className="pointer-events-none absolute -bottom-24 right-12 size-72 rounded-full bg-shah-lapis-500/12 blur-3xl dark:bg-shah-lapis-500/20" />

              <SectionHeader
                eyebrow="Epic Scale"
                title="روایتی به وسعت یک جهان"
                inverse
              />

              <div className="relative mt-8 grid gap-4">
                <StatItem label="زبان" value="فارسیِ باشکوه" />
                <StatItem label="جهان روایت" value="اسطوره، پهلوانی، تاریخ" />
                <StatItem label="محور اثر" value="خرد، داد، فرّه و سرنوشت" />
              </div>
            </div>
          </section>

          <Section>
            <SectionHeader title="چرا شاهنامه هنوز مهم است؟" centered />
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {importanceItems.map((item) => (
                <FeatureCard key={item.title} {...item} />
              ))}
            </div>
          </Section>

          <Section>
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <SectionHeader
                  eyebrow="Narrative Timeline"
                  title="سه قلمرو اصلی شاهنامه"
                />
                <p className="mt-5 max-w-xl text-sm font-semibold leading-8 text-shah-black-500 dark:text-zinc-400">
                  شاهنامه را می‌توان همچون سفری از سپیده‌دم اسطوره تا قلمرو
                  تاریخ خواند؛ سفری که در هر مرحله، چهره‌ای تازه از انسان، قدرت
                  و سرنوشت آشکار می‌کند.
                </p>
              </div>

              <div className="grid gap-4">
                {timelineItems.map((item, index) => (
                  <TimelineCard key={item.title} index={index + 1} {...item} />
                ))}
              </div>
            </div>
          </Section>

          <Section>
            <article className="relative overflow-hidden rounded-[2.25rem] border border-shah-lapis-700/18 bg-linear-to-br from-white via-shah-cream-50 to-shah-lapis-50/80 p-7 text-right text-shah-black-950 shadow-[0_34px_100px_rgba(26,62,141,0.12)] dark:border-shah-gold-500/18 dark:from-shah-lapis-950 dark:via-[#101827] dark:to-[#070707] dark:text-white dark:shadow-[0_34px_100px_rgba(19,33,66,0.32)] md:p-10">
              <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-shah-gold-500/12 blur-3xl dark:bg-shah-gold-400/12" />
              <div className="pointer-events-none absolute -bottom-24 left-12 size-80 rounded-full bg-shah-lapis-500/12 blur-3xl dark:bg-shah-lapis-400/16" />

              <div className="relative grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
                <div>
                  <SectionHeader
                    eyebrow="Shahnameh Sara"
                    title="درباره شاهنامه‌سرا"
                    inverse
                  />

                  <p className="mt-6 max-w-3xl text-base font-semibold leading-9 text-shah-black-600 dark:text-shah-cream-100/82 md:text-lg">
                    شاهنامه‌سرا تلاشی است برای بازنمایی جهان شاهنامه در قالبی
                    امروزی، تعاملی و قابل جستجو؛ جایی که روایت‌ها شخصیت‌ها و
                    پیوندهای روایی فقط خوانده نمی‌شوند، بلکه کشف می‌شوند.
                  </p>

                  <p className="mt-5 max-w-3xl text-sm font-semibold leading-8 text-shah-black-500 dark:text-shah-cream-100/62">
                    هدف این پروژه، ساختن پلی میان متن کهن و تجربه دیجیتال امروز
                    است؛ تجربه‌ای برای خواننده کنجکاو، پژوهشگر، طراح، روایت‌گر و
                    هر کسی که می‌خواهد به جهان فردوسی نزدیک‌تر شود.
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-shah-gold-500/18 bg-white/72 p-5 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-white/6">
                  <h3 className="text-lg font-black text-shah-gold-800 dark:text-shah-gold-200">
                    در شاهنامه‌سرا چه می‌بینید؟
                  </h3>

                  <div className="mt-5 grid gap-3">
                    {projectFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 rounded-2xl border border-shah-gold-500/14 bg-shah-cream-50/85 px-4 py-3 text-sm font-bold text-shah-black-700 dark:border-white/8 dark:bg-black/18 dark:text-shah-cream-100/82"
                      >
                        <span className="size-2 rounded-full bg-shah-gold-400 shadow-[0_0_14px_rgba(212,175,55,0.55)]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </Section>

          <Section>
            <article className="relative overflow-hidden rounded-4xl border border-shah-gold-500/18 bg-white/80 p-8 text-center shadow-[0_24px_70px_rgba(26,26,26,0.07)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5.5 md:p-12">
              <div className="pointer-events-none absolute left-1/2 top-0 size-72 -translate-x-1/2 rounded-full bg-shah-gold-500/10 blur-3xl" />

              <SectionHeader title="کاوش را آغاز کنید" centered />

              <p className="relative mx-auto mt-5 max-w-2xl text-sm font-semibold leading-8 text-shah-black-500 dark:text-zinc-400">
                از روایت‌ها شروع کنید، ناموران را بشناسید، یا مسیر تبارها و
                پیوندهای روایی را در نقشه تعاملی دنبال کنید.
              </p>

              <CTAButtons />
            </article>
          </Section>
        </div>
      </main>
    </SiteLayout>
  );
}

function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={className}>{children}</section>;
}

function PremiumCard({ children }: { children: ReactNode }) {
  return (
    <article className="relative overflow-hidden rounded-4xl border border-shah-gold-500/18 bg-white/82 p-7 text-right shadow-[0_24px_70px_rgba(26,26,26,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5.5 dark:shadow-black/35 md:p-10">
      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-shah-gold-500/10 blur-3xl" />
      <div className="relative">{children}</div>
    </article>
  );
}

function SectionHeader({
  centered = false,
  eyebrow,
  inverse = false,
  title,
}: {
  centered?: boolean;
  eyebrow?: string;
  inverse?: boolean;
  title: string;
}) {
  return (
    <header className={centered ? "text-center" : "text-right"}>
      {eyebrow ? (
        <p
          className={`text-[10px] font-black uppercase tracking-[0.38em] ${
            inverse
              ? "text-shah-gold-700/80 dark:text-shah-gold-300/80"
              : "text-shah-gold-700/70 dark:text-shah-gold-300/70"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}

      <h2
        className={`mt-3 text-3xl font-black tracking-tight md:text-5xl ${
          inverse
            ? "text-shah-black-950 dark:text-white"
            : "text-shah-black-950 dark:text-white"
        }`}
      >
        {title}
      </h2>
    </header>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-shah-gold-500/18 bg-white/72 p-5 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-white/6">
      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-shah-gold-700/75 dark:text-shah-gold-300/70">
        {label}
      </p>
      <p className="mt-3 text-xl font-black text-shah-lapis-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function FeatureCard({
  description,
  icon,
  title,
}: {
  description: string;
  icon: string;
  title: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[1.7rem] border border-shah-gold-500/16 bg-white/78 p-6 text-right shadow-[0_18px_48px_rgba(26,26,26,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-shah-gold-500/38 hover:shadow-[0_26px_70px_rgba(212,175,55,0.12)] dark:border-white/10 dark:bg-white/5.5 dark:shadow-black/25">
      <div className="pointer-events-none absolute -left-16 -top-16 size-40 rounded-full bg-shah-gold-500/8 blur-2xl opacity-0 transition group-hover:opacity-100" />

      <span className="relative grid size-12 place-items-center rounded-2xl border border-shah-gold-500/18 bg-shah-gold-500/10 text-xl font-black text-shah-gold-700 transition group-hover:bg-shah-gold-500 group-hover:text-white dark:text-shah-gold-200 dark:group-hover:text-shah-black-950">
        {icon}
      </span>

      <h3 className="relative mt-5 text-xl font-black text-shah-black-950 dark:text-white">
        {title}
      </h3>

      <p className="relative mt-3 text-sm font-semibold leading-7 text-shah-black-600 dark:text-zinc-300">
        {description}
      </p>
    </article>
  );
}

function TimelineCard({
  index,
  text,
  title,
}: {
  index: number;
  text: string;
  title: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[1.6rem] border border-shah-gold-500/16 bg-white/78 p-6 text-right shadow-[0_18px_48px_rgba(26,26,26,0.07)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-shah-gold-500/38 dark:border-white/10 dark:bg-white/5.5">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-shah-gold-500/22 bg-shah-gold-500/10 text-sm font-black text-shah-gold-800 dark:text-shah-gold-200">
          {index.toLocaleString("fa-IR")}
        </span>

        <div>
          <h3 className="text-xl font-black text-shah-black-950 dark:text-white">
            {title}
          </h3>
          <p className="mt-3 text-sm font-semibold leading-8 text-shah-black-600 dark:text-zinc-300">
            {text}
          </p>
        </div>
      </div>
    </article>
  );
}

function CTAButtons() {
  return (
    <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
      {ctaItems.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          className={
            index === 0
              ? "inline-flex h-13 items-center justify-center rounded-2xl bg-shah-lapis-800 px-7 text-sm font-black text-shah-gold-100 shadow-lg shadow-shah-lapis-900/18 transition hover:-translate-y-0.5 hover:bg-shah-lapis-700 hover:text-white dark:bg-shah-gold-500 dark:text-shah-black-950 dark:hover:bg-shah-gold-400"
              : "inline-flex h-13 items-center justify-center rounded-2xl border border-shah-gold-500/28 bg-white/65 px-7 text-sm font-black text-shah-gold-800 shadow-sm transition hover:-translate-y-0.5 hover:border-shah-gold-500/60 hover:bg-shah-gold-500 hover:text-white dark:border-white/10 dark:bg-white/5.5 dark:text-shah-gold-100 dark:hover:bg-shah-gold-500 dark:hover:text-shah-black-950"
          }
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
