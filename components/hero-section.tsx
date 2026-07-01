import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "./button";

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#050505] px-6 py-24 md:h-svh md:justify-start md:py-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          alt="تصویر فردوسی"
          src="/images/ferdosi-1.png"
          fill
          priority
          className="object-cover md:object-center"
          style={{ objectPosition: "75% center" }}
          sizes="100vw"
        />
      </div>

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-black/55 md:bg-transparent md:bg-linear-to-r md:from-black/95 md:via-black/20 md:to-transparent" />

      {/* Main Content */}
      <div className="relative z-20 mx-auto flex w-full max-w-7.5xl justify-center md:justify-end">
        <div className="flex max-w-2xl flex-col items-center gap-6 text-center md:items-stretch md:text-right">
          {/* متن */}
          <div className="space-y-4">
            <h1 className="hero-reveal text-5xl md:text-7xl font-black leading-[1.15] text-white">
              طلوع حماسه در دیار پهلوانان{" "}
              <span className="hero-gold-glow text-shah-gold-400">شاهنامه</span>
            </h1>

            <p className="hero-reveal hero-reveal-delay-1 mx-auto max-w-lg text-base md:mx-0 md:text-lg font-medium leading-relaxed text-white">
              گام در راه داستان‌های کهن ایران؛ <br />
              <span className="text-white">
                از نخستین شاهان تا دلاوری‌های رستم و سهراب.
              </span>
            </p>
          </div>
          {/* دکمه‌ها */}
          <div className="hero-reveal-actions mt-4 flex flex-wrap justify-center gap-4 md:justify-normal">
            <Link
              href="/characters"
              className={buttonClasses(
                "blue",
                "h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all hover:shadow-blue-500/30 active:scale-95",
              )}
            >
              کاوش در شخصیت‌ها
            </Link>

            <Link
              href="/stories"
              className={buttonClasses(
                "red",
                "h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all border border-white/80 bg-white/10 text-white hover:bg-white/15 hover:border-white/40",
              )}
            >
              داستان‌های حماسی
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
