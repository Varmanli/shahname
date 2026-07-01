import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { PageHeroHeader } from "@/components/page-hero-header";
import { SiteLayout } from "@/components/site-layout";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "تماس با ما",
  description:
    "ارسال پیشنهاد، نقد محتوایی، گزارش خطا یا درخواست همکاری فرهنگی و هنری با تیم شاهنامه‌سرا از طریق فرم تماس.",
  path: "/contact",
});

const infoCards = [
  {
    description:
      "اگر ایده‌ای برای بهتر شدن روایت‌ها، شخصیت‌ها، تبارنامه یا تجربه کاربری سایت دارید.",
    icon: "✦",
    title: "پیشنهاد و بهبود",
  },
  {
    description:
      "اگر خطایی در متن، پیوندهای تبارنامه، اطلاعات شخصیت‌ها یا مسیرهای سایت دیدید.",
    icon: "!",
    title: "گزارش خطا",
  },
  {
    description:
      "برای همکاری در پژوهش، تولید محتوا، تصویرسازی، روایت‌پردازی یا توسعه پروژه.",
    icon: "◇",
    title: "همکاری با پروژه",
  },
];

export default function ContactPage() {
  return (
    <SiteLayout withHeaderOffset>
      <main
        dir="rtl"
        className="min-h-screen overflow-hidden  px-5 pb-28 pt-32 text-shah-black-900 dark:text-shah-cream-100 md:px-8 md:pt-40"
      >
        <section className="relative mx-auto max-w-7xl">
          <div className="pointer-events-none absolute left-1/2 top-0 size-96 -translate-x-1/2 rounded-full bg-shah-gold-500/10 blur-[110px] dark:bg-shah-gold-400/8" />

          <PageHeroHeader
            className="my-20 md:mb-36"
            description="برای پیشنهاد، گزارش خطا، نقد محتوایی یا همکاری فرهنگی و هنری، پیام خود را از این بخش برای ما ارسال کنید."
            eyebrow="Contact Shahnameh Sara"
            highlight="شاهنامه‌سرا"
            title="تماس با"
          />

          <div className="relative mt-24 grid gap-10 lg:grid-cols-[1fr_26rem] lg:items-start">
            {/* فرم تماس */}
            <div className="group relative">
              {/* جلوه درخشش پشت کارت در حالت هاور */}
              <div className="absolute -inset-1 rounded-[2.5rem] bg-linear-to-tr from-shah-gold-500/20 to-shah-lapis-500/20 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />

              <div className="relative overflow-hidden rounded-[2.5rem] border border-shah-gold-500/15 bg-white/70 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/3 md:p-12">
                <div className="mb-10 flex flex-col gap-2">
                  <h2 className="text-3xl font-black text-shah-black-950 dark:text-white">
                    ارسال پیام مستقیم
                  </h2>
                  <div className="h-1.5 w-12 rounded-full bg-shah-gold-500" />
                  <p className="mt-4 text-sm font-medium leading-7 text-shah-black-500 dark:text-zinc-400">
                    پیام‌های شما توسط تیم محتوایی بررسی و در کمترین زمان پاسخ
                    داده خواهد شد.
                  </p>
                </div>

                <ContactForm />
              </div>
            </div>

            {/* سایدبار اطلاعات */}
            <aside className="flex flex-col gap-4">
              {infoCards.map((card) => (
                <article
                  key={card.title}
                  className="group relative overflow-hidden rounded-[1.7rem] border border-shah-gold-500/15 bg-white/75 p-5 text-right shadow-[0_18px_48px_rgba(26,26,26,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-shah-gold-500/40 hover:bg-white/90 dark:border-white/10 dark:bg-white/5.5 dark:hover:bg-white/7.5"
                >
                  <div className="pointer-events-none absolute -left-16 -top-16 size-40 rounded-full bg-shah-gold-500/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-shah-gold-500/20 bg-shah-gold-500/10 text-xl font-black text-shah-gold-700 transition-all duration-300 group-hover:bg-shah-gold-500 group-hover:text-white dark:text-shah-gold-200 dark:group-hover:text-shah-black-950">
                      {card.icon}
                    </span>

                    <div>
                      <h3 className="text-lg font-black text-shah-black-950 transition-colors group-hover:text-shah-gold-700 dark:text-white dark:group-hover:text-shah-gold-300">
                        {card.title}
                      </h3>

                      <p className="mt-2 text-sm font-semibold leading-7 text-shah-black-600 dark:text-zinc-300">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}

              <div className="relative overflow-hidden rounded-[1.8rem] border border-shah-gold-500/15 bg-shah-lapis-950 p-6 text-right text-white shadow-[0_24px_70px_rgba(19,33,66,0.24)]">
                <div className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-shah-gold-400/14 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 right-10 size-48 rounded-full bg-shah-lapis-400/18 blur-3xl" />

                <div className="relative">
                  <h3 className="text-xl font-black text-white">
                    پیش از ارسال پیام
                  </h3>

                  <p className="mt-4 text-sm font-semibold leading-8 text-shah-cream-100/78">
                    اگر پیام شما درباره یک{" "}
                    <span className="font-black text-shah-gold-300">
                      داستان، شخصیت یا تبارنامه
                    </span>{" "}
                    خاص است، نام آن را در موضوع یا متن پیام بنویسید تا سریع‌تر
                    بررسی شود.
                  </p>
                </div>

                <div className="absolute bottom-0 right-0 h-1 w-full bg-linear-to-l from-shah-lapis-500 via-shah-gold-400 to-shah-gold-700" />
              </div>
            </aside>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
