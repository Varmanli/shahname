import Link from "next/link";

const footerLinks = [
  { label: "خانه", href: "/" },
  { label: "شخصیت‌ها", href: "/characters" },
  { label: "داستان‌ها", href: "/stories" },
  { label: "درباره شاهنامه", href: "/about" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-zinc-200 bg-white px-8 py-16 dark:border-white/5 dark:bg-shah-black-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12">
        {/* بخش برندینگ مرکزی */}
        <div className="flex flex-col items-center text-center">
          <p className="text-[10px] font-black tracking-[0.6em] text-shah-gold-600 uppercase opacity-70">
            Ancient Wisdom
          </p>
          <h2 className="mt-3 text-5xl font-black tracking-tighter text-zinc-950 dark:text-white">
            شاهـ<span className="text-shah-gold-500">نامه</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            پایگاهی برای مرور شخصیت‌ها، داستان‌ها و جهان حماسی شاهنامه؛ جایی که
            اساطیر دگر بار جان می‌گیرند.
          </p>
        </div>

        {/* ناوبری ساده و افقی */}
        <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-black text-zinc-600 transition-colors hover:text-shah-gold-600 dark:text-zinc-400 dark:hover:text-shah-gold-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* خط تزیینی جداکننده */}
        <div className="flex items-center gap-4 w-full max-w-xs opacity-20">
          <div className="h-px flex-1 bg-linear-to-r from-transparent to-shah-gold-500"></div>
          <div className="h-1.5 w-1.5 rotate-45 bg-shah-gold-500"></div>
          <div className="h-px flex-1 bg-linear-to-l from-transparent to-shah-gold-500"></div>
        </div>

        {/* بخش نهایی - کپی‌رایت */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            © ۱۴۰۵ شاهنامه • طراحی برای جاودانگی
          </p>
        </div>
      </div>
    </footer>
  );
}
