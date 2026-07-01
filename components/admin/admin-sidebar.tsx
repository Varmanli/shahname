"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBookOpen,
  FiGitBranch,
  FiHome,
  FiLogOut,
  FiMail,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";

const menuItems = [
  { label: "داشبورد", href: "/admin", icon: FiHome, hint: "نمای کلی" },
  { label: "شخصیت‌ها", href: "/admin/characters", icon: FiUsers, hint: "ناموران" },
  { label: "تبارنامه‌ها", href: "/admin/lineages", icon: FiGitBranch, hint: "خاندان‌ها" },
  { label: "داستان‌ها", href: "/admin/stories", icon: FiBookOpen, hint: "روایت‌ها" },
  { label: "پیام‌های تماس", href: "/admin/contact-messages", icon: FiMail, hint: "ارتباطات" },
  { label: "تنظیمات", href: "/admin/settings", icon: FiSettings, hint: "سایت" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 right-0 z-50 hidden w-72 border-l border-shah-gold-500/15 bg-white/78 shadow-2xl shadow-shah-black-900/10 backdrop-blur-2xl lg:flex lg:flex-col dark:border-white/10 dark:bg-[#101010]/82 dark:shadow-black/40">
      <div className="relative overflow-hidden border-b border-shah-gold-500/15 px-5 py-7 dark:border-white/8">
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-shah-gold-500/15 blur-3xl" />
        <Link href="/admin" className="relative flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-shah-lapis-800 text-xl font-black text-shah-gold-200 shadow-lg shadow-shah-lapis-900/20">
            ش
          </span>
          <span>
            <span className="block text-2xl font-black tracking-tight text-foreground dark:text-white">
              پنل مدیریت
            </span>
            <span className="mt-1 block text-xs font-black text-shah-gold-700 dark:text-shah-gold-300">
              Shahname Command
            </span>
          </span>
        </Link>
        <div className="relative mt-6 w-full">
          <AdminThemeToggle />
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6 custom-scrollbar">
        {menuItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-right transition-all duration-300 
                ${
                  active
                    ? "bg-shah-lapis-800 text-white shadow-lg shadow-shah-lapis-900/18 dark:bg-shah-gold-500 dark:text-shah-black-950 dark:shadow-shah-gold-950/20"
                    : "text-shah-black-700 hover:bg-shah-lapis-700/8 hover:text-shah-lapis-900 dark:text-zinc-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
                }`}
            >
              <span
                className={`relative grid size-10 shrink-0 place-items-center rounded-xl transition ${
                  active
                    ? "bg-white/12 text-shah-gold-200 dark:bg-shah-black-950/12 dark:text-shah-black-950"
                    : "bg-shah-gold-500/10 text-shah-gold-700 group-hover:bg-shah-gold-500/18 dark:text-shah-gold-200"
                }`}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-black">{item.label}</span>
                <span
                  className={`mt-0.5 block text-xs font-bold ${
                    active
                      ? "text-white/70 dark:text-shah-black-950/65"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.hint}
                </span>
              </span>
              {active && (
                <span className="absolute inset-y-3 right-0 w-1 rounded-l-full bg-shah-gold-400 shadow-md dark:bg-shah-lapis-900" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-shah-gold-500/15 px-5 py-5 dark:border-white/8">
        <div className="flex items-center gap-3 rounded-2xl border border-shah-gold-500/15 bg-shah-cream-50/70 p-3 shadow-inner dark:border-white/8 dark:bg-white/[0.045]">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-shah-gold-500/15 font-black text-shah-gold-700 dark:text-shah-gold-200">
            A
          </div>
          <div className="min-w-0 flex flex-col">
            <span className="truncate text-sm font-black text-foreground dark:text-white">
              امیرحسین
            </span>
            <span className="text-xs font-bold text-muted-foreground dark:text-zinc-400">
              مدیر کل سیستم
            </span>
          </div>
          <Link
            href="/admin/logout"
            className="mr-auto grid size-10 place-items-center rounded-xl text-shah-black-600 transition hover:bg-red-500/10 hover:text-red-700 dark:text-zinc-300 dark:hover:text-red-200"
            title="خروج"
          >
            <FiLogOut className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex flex-col border-b border-shah-gold-500/15 bg-white/82 px-4 py-4 shadow-lg shadow-shah-black-900/5 backdrop-blur-2xl lg:hidden dark:border-white/10 dark:bg-[#101010]/88">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/admin" className="text-2xl font-extrabold text-foreground dark:text-white">
          پنل <span className="text-shah-gold-500">مدیریت</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/logout"
            className="grid size-11 place-items-center rounded-2xl bg-card/70 text-foreground transition hover:bg-red-500/10 hover:text-red-700 dark:bg-shah-black-900/70 dark:text-zinc-300 dark:hover:text-red-200"
            title="خروج"
          >
            <FiLogOut className="size-5" aria-hidden />
          </Link>
          <div className="w-36">
          <AdminThemeToggle />
          </div>
        </div>
      </div>

      <nav className="flex gap-3 overflow-x-auto no-scrollbar">
        {menuItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-sm font-black transition-all duration-300
                ${
                  active
                    ? "bg-shah-lapis-500 text-white shadow-md dark:bg-shah-gold-500 dark:text-shah-black-950"
                    : "bg-card/70 text-foreground hover:bg-shah-lapis-50 dark:bg-shah-black-900/70 dark:text-zinc-300 dark:hover:bg-white/8 dark:hover:text-white"
                }`}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
