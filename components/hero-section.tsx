import Link from "next/link";

import { ProtectedImage } from "@/components/protected-image";

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#050505] px-6 py-24 md:h-svh md:justify-start md:py-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ProtectedImage
          alt="تصویر فردوسی"
          src="/images/ferdosi-v2.webp"
          fill
          priority
          className="object-cover object-[18%_center] md:object-[75%_center]"
          sizes="100vw"
        />
      </div>

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-black/55 md:bg-transparent md:bg-linear-to-l md:from-black/75 md:via-black/10 md:to-transparent" />

      {/* Main Content */}
      <div className="relative z-20 mx-auto flex w-full max-w-7.5xl justify-center md:justify-start md:pr-12">
        <div className="flex max-w-2xl flex-col items-center gap-6 text-center md:items-stretch md:text-right">
          {/* متن */}
          <div className="space-y-4">
            <h1 className="hero-reveal text-5xl md:text-7xl font-black leading-[1.15] text-white">
              طلوع حماسه در دیار پهلوانان{" "}
              <span className="hero-gold-glow text-shah-gold-400">شاهنامه</span>
            </h1>

            <p className="hero-reveal hero-reveal-delay-1 mx-auto max-w-lg text-base md:mx-0 md:text-lg font-medium leading-relaxed text-white">
              گام در راه روایت‌های کهن ایران؛ <br />
              <span className="text-white">
                از نخستین شاهان تا دلاوری‌های رستم و سهراب.
              </span>
            </p>
          </div>
          {/* دکمه‌ها */}
          <div className="hero-reveal-actions mt-4 flex flex-wrap justify-center gap-4 md:justify-normal">
            <Link
              href="/characters"
              aria-label="کاوش در شخصیت‌ها"
              className="group relative h-24 w-72 max-w-full shrink-0 select-none overflow-hidden rounded-2xl transition-all hover:-translate-y-1 active:scale-95 sm:w-80"
            >
              <ProtectedImage
                src="/button/character-v2.png"
                alt="کاوش در شخصیت‌ها"
                fill
                sizes="(min-width: 640px) 20rem, 18rem"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>

            <Link
              href="/stories"
              aria-label="روایت‌های حماسی"
              className="group relative h-24 w-72 max-w-full shrink-0 select-none overflow-hidden rounded-2xl transition-all hover:-translate-y-1 active:scale-95 sm:w-80"
            >
              <ProtectedImage
                src="/button/story.png"
                alt="روایت‌های حماسی"
                fill
                sizes="(min-width: 640px) 20rem, 18rem"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Sidebar Info */}
      <div className="absolute bottom-12 left-10 z-20 hidden md:block">
        <div className="hero-side-note flex items-center gap-4 text-[11px] font-medium tracking-widest text-zinc-500 [writing-mode:vertical-lr] rotate-180">
          <span className="inline-block h-10 w-px bg-zinc-800 mb-2"></span>
          برای کاوش ورق بزنید — ۱۴۰۵
        </div>
      </div>

      {/* Bottom Mask */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[#050505] to-transparent" />
    </section>
  );
}
