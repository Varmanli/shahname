import type { Metadata } from "next";
import Link from "next/link";

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
      "شاهنامه فقط یک اثر ادبی نیست؛ یکی از مهم‌ترین سرچشمه‌های شناخت حافظه جمعی، آیین‌ها و جهان‌بینی ایرانی است.",
    title: "حافظه‌ای برای یک ملت",
  },
  {
    description:
      "فردوسی فارسی را به زبانی برای اندیشیدن، روایت‌کردن و به‌یادسپردن تاریخ و افسانه‌های ایران تبدیل کرد.",
    title: "پاسدار زبان فارسی",
  },
  {
    description:
      "قهرمانان شاهنامه با زور بازو تعریف نمی‌شوند؛ خرد، داد، وفاداری و انتخاب‌های دشوار معیار پهلوانی آنان است.",
    title: "پهلوانی به‌مثابه اخلاق",
  },
  {
    description:
      "در این روایت بزرگ، پیروزی و شکست، عشق و سوگ، قدرت و مسئولیت، همگی در برابر داوری زمان قرار می‌گیرند.",
    title: "روایتی برای امروز",
  },
];

const domains = [
  {
    title: "بخش اسطوره‌ای",
    text: "از کیومرث و هوشنگ تا جمشید و ضحاک؛ جهانی که در آن نخستین شکل‌های شهریاری، قانون، آتش و نبرد همیشگی روشنایی و تاریکی پدیدار می‌شود.",
  },
  {
    title: "بخش پهلوانی",
    text: "با زال، رودابه، رستم، سهراب، سیاوش و کیخسرو؛ جایی که شاهنامه از اسطوره فاصله می‌گیرد و انسان را در پیچیده‌ترین آزمون‌های عشق، قدرت و سرنوشت می‌سنجد.",
  },
  {
    title: "بخش تاریخی",
    text: "روایتی نزدیک‌تر به تاریخ ایران و فرمانروایانی که با تصمیم‌های خود سرنوشت یک سرزمین را تغییر می‌دهند؛ از شکوه قدرت تا فرسودگی و فروپاشی آن.",
  },
];

const projectFeatures = [
  "روایت‌های بخش‌بندی‌شده و قابل دنبال‌کردن",
  "پرونده شخصیت‌ها، نقش‌ها و پیوندهای روایی",
  "تبارنامه‌ای برای دیدن ارتباط میان ناموران",
  "جستجو و پیمایش ساده در جهان شاهنامه",
];

export default function AboutPage() {
  return (
    <SiteLayout withHeaderOffset>
      <main
        dir="rtl"
        className="min-h-screen overflow-hidden text-shah-black-900 dark:text-shah-cream-100"
      >
        <header className="mx-auto max-w-4xl px-5 pb-24 pt-36 text-center md:px-8 md:pb-32 md:pt-44">
          <p className="text-[10px] font-black uppercase tracking-[0.42em] text-shah-gold-700/75 dark:text-shah-gold-300/75">
            The Great Persian Epic
          </p>

          <h1 className="mt-5 text-5xl font-black tracking-tight text-shah-black-950 dark:text-white md:text-7xl">
            درباره <span className="text-shah-gold-500">شاهنامه</span>
          </h1>

          <div className="mx-auto mt-8 flex h-1 w-16 overflow-hidden rounded-full bg-shah-black-100 dark:bg-white/10">
            <span className="h-full w-1/3 bg-shah-lapis-500" />
            <span className="h-full w-2/3 bg-shah-gold-500" />
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-base font-semibold leading-9 text-shah-black-600 dark:text-zinc-300 md:text-lg">
            شاهنامه روایتِ بلند زندگی ایرانی است؛ از نخستین شهریاران و پیدایش
            جهان تا پهلوانی، عشق، سوگ و گردش روزگار. اینجا قرار است پیش از هر
            چیز، خودِ روایت و معنای ماندگار آن دیده شود.
          </p>
        </header>

        <div className="mx-auto grid w-full max-w-6xl gap-28 px-5 pb-28 md:gap-36 md:px-8">
          <section className="grid gap-14 border-t border-shah-gold-500/20 pt-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
            <SectionHeading eyebrow="What is Shahnameh" title="شاهنامه چیست؟" />

            <div className="space-y-6 text-base font-semibold leading-9 text-shah-black-600 dark:text-zinc-300 md:text-lg">
              <p>
                شاهنامه، اثر جاودان حکیم ابوالقاسم فردوسی، یکی از ستون‌های اصلی
                فرهنگ و ادبیات ایران است؛ روایتی که اسطوره، تاریخ و تجربه
                انسانی را در کنار هم می‌نشاند. در این جهان، پادشاهی تنها به
                تخت و تاج معنا نمی‌شود و پهلوانی تنها نیروی بازو نیست؛ هرکس با
                انتخاب‌هایش در برابر خرد، داد و سرنوشت سنجیده می‌شود.
              </p>
              <p className="text-shah-black-500 dark:text-zinc-400">
                فردوسی روایت‌های پراکنده و کهن ایران را در زبانی استوار، آهنگین
                و روشن گرد آورد. به همین دلیل شاهنامه هم سندی فرهنگی برای
                شناخت گذشته است و هم متنی زنده که هنوز درباره مسئولیت، قدرت،
                فقدان و امید با ما گفت‌وگو می‌کند.
              </p>
            </div>
          </section>

          <section>
            <div className="max-w-2xl">
              <SectionHeading
                eyebrow="Why it still matters"
                title="چرا شاهنامه هنوز مهم است؟"
              />
              <p className="mt-6 text-base font-semibold leading-9 text-shah-black-500 dark:text-zinc-400">
                ماندگاری شاهنامه فقط به قدمت آن مربوط نیست. این اثر هنوز پرسش‌هایی
                را پیش روی ما می‌گذارد کهنه نمی‌شوند: چه چیزی یک فرمانروا را
                شایسته می‌کند؟ انسان در برابر سرنوشت چه اختیاری دارد؟ و چگونه
                می‌توان در زمانه آشوب، زبان و هویت خود را زنده نگه داشت؟
              </p>
            </div>

            <div className="mt-12 grid gap-x-12 gap-y-10 border-y border-shah-gold-500/18 py-2 md:grid-cols-2">
              {importanceItems.map((item, index) => (
                <article
                  key={item.title}
                  className="border-b border-shah-black-200/70 py-8 last:border-b-0 dark:border-white/10"
                >
                  <div className="flex items-start gap-4">
                    <span className="pt-1 text-sm font-black text-shah-gold-600 dark:text-shah-gold-300">
                      {(index + 1).toLocaleString("fa-IR")}
                    </span>
                    <div>
                      <h3 className="text-xl font-black text-shah-black-950 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm font-semibold leading-8 text-shah-black-600 dark:text-zinc-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
            <div>
              <SectionHeading
                eyebrow="Narrative Timeline"
                title="سه قلمرو اصلی شاهنامه"
              />
              <p className="mt-6 text-base font-semibold leading-9 text-shah-black-500 dark:text-zinc-400">
                شاهنامه را می‌توان سفری پیوسته از سپیده‌دم اسطوره تا مرزهای
                تاریخ دانست؛ سفری که در هر مرحله، تعریف تازه‌ای از انسان، قدرت
                و مسئولیت پیش روی خواننده می‌گذارد.
              </p>
            </div>

            <div className="divide-y divide-shah-gold-500/18 border-y border-shah-gold-500/18">
              {domains.map((domain, index) => (
                <article
                  key={domain.title}
                  className="grid gap-4 py-8 sm:grid-cols-[auto_1fr] sm:gap-7"
                >
                  <span className="text-sm font-black text-shah-gold-600 dark:text-shah-gold-300">
                    {(index + 1).toLocaleString("fa-IR")}
                  </span>
                  <div>
                    <h3 className="text-2xl font-black text-shah-black-950 dark:text-white">
                      {domain.title}
                    </h3>
                    <p className="mt-3 text-sm font-semibold leading-8 text-shah-black-600 dark:text-zinc-300 md:text-base">
                      {domain.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden border-y border-shah-gold-500/20 py-16 md:py-20">
            <div className="pointer-events-none absolute -left-32 top-1/2 size-80 -translate-y-1/2 rounded-full bg-shah-lapis-500/10 blur-3xl dark:bg-shah-lapis-500/16" />

            <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-24">
              <div>
                <SectionHeading eyebrow="Shahnameh Sara" title="درباره شاهنامه‌سرا" />
                <div className="mt-7 space-y-5 text-base font-semibold leading-9 text-shah-black-600 dark:text-zinc-300 md:text-lg">
                  <p>
                    شاهنامه‌سرا تلاشی است برای نزدیک‌کردن این جهان بزرگ به
                    تجربه خواندن امروز؛ جایی که روایت‌ها، شخصیت‌ها و پیوندهای
                    میان آن‌ها منظم و قابل کشف کنار هم قرار می‌گیرند.
                  </p>
                  <p className="text-shah-black-500 dark:text-zinc-400">
                    هدف پروژه، جایگزین‌کردن متن اصلی نیست؛ بلکه ساختن مسیری
                    روشن برای ورود به آن است. می‌توانید با یک روایت شروع کنید،
                    سرگذشت یک نامور را دنبال کنید و بعد از مسیر تبارها و
                    پیوندها، تصویر بزرگ‌تری از شاهنامه بسازید.
                  </p>
                </div>
              </div>

              <div className="border-r border-shah-gold-500/25 pr-6 sm:pr-8">
                <h3 className="text-lg font-black text-shah-black-950 dark:text-white">
                  اینجا چه چیزی پیدا می‌کنید؟
                </h3>
                <ul className="mt-6 space-y-4 text-sm font-bold leading-7 text-shah-black-600 dark:text-zinc-300">
                  {projectFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-2 size-2 shrink-0 rounded-full bg-shah-gold-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="text-center">
            <SectionHeading title="از کجا شروع کنیم؟" centered />
            <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-9 text-shah-black-500 dark:text-zinc-400">
              یک روایت را بخوانید، با ناموران آشنا شوید یا درخت پیوندهای
              شاهنامه را دنبال کنید. هر مسیر، دری تازه به این جهان حماسی باز
              می‌کند.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/stories"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-shah-gold-500 px-7 text-sm font-black text-shah-black-950 transition hover:-translate-y-0.5 hover:bg-shah-gold-400"
              >
                مشاهده روایت‌ها
              </Link>
              <Link
                href="/characters"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-shah-gold-500/28 px-7 text-sm font-black text-shah-gold-700 transition hover:-translate-y-0.5 hover:border-shah-gold-500 hover:bg-shah-gold-500/10 dark:text-shah-gold-200"
              >
                ناموران شاهنامه
              </Link>
              <Link
                href="/lineage"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-shah-black-200 px-7 text-sm font-black text-shah-black-700 transition hover:-translate-y-0.5 hover:border-shah-gold-500 dark:border-white/10 dark:text-zinc-300"
              >
                تبارنامه
              </Link>
            </div>
          </section>
        </div>
      </main>
    </SiteLayout>
  );
}

function SectionHeading({
  centered = false,
  eyebrow,
  title,
}: {
  centered?: boolean;
  eyebrow?: string;
  title: string;
}) {
  return (
    <header className={centered ? "text-center" : "text-right"}>
      {eyebrow ? (
        <p className="text-[10px] font-black uppercase tracking-[0.36em] text-shah-gold-700/75 dark:text-shah-gold-300/75">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-3xl font-black tracking-tight text-shah-black-950 dark:text-white md:text-5xl">
        {title}
      </h2>
    </header>
  );
}
