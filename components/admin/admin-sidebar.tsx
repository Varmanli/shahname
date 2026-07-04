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
  {
    label: "شخصیت‌ها",
    href: "/admin/characters",
    icon: FiUsers,
    hint: "ناموران",
  },
  {
    label: "تبارنامه‌ها",
    href: "/admin/lineages",
    icon: FiGitBranch,
    hint: "خاندان‌ها",
  },
  {
    label: "داستان‌ها",
    href: "/admin/stories",
    icon: FiBookOpen,
    hint: "روایت‌ها",
  },
  {
    label: "پیام‌های تماس",
    href: "/admin/contact-messages",
    icon: FiMail,
    hint: "ارتباطات",
  },
  { label: "تنظیمات", href: "/admin/settings", icon: FiSettings, hint: "سایت" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 right-0 z-50 hidden w-64 border-l border-shah-gold-500/10 bg-white/72 shadow-xl shadow-shah-black-900/8 backdrop-blur-2xl lg:flex lg:flex-col dark:border-white/10 dark:bg-[#0f0f10]/88 dark:shadow-black/30">
      <div className="border-b border-shah-gold-500/10 px-4 py-4 dark:border-white/8">
        <div className="mt-3">
          <AdminThemeToggle />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        <div className="grid gap-1.5">
          {menuItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-right transition-all duration-200 ${
                  active
                    ? "bg-shah-lapis-900 text-white shadow-md shadow-shah-lapis-900/15 dark:bg-shah-gold-500 dark:text-shah-black-950 dark:shadow-shah-gold-500/10"
                    : "text-foreground/78 hover:bg-shah-gold-500/8 hover:text-foreground dark:text-zinc-300 dark:hover:bg-white/5.5 dark:hover:text-white"
                }`}
              >
                {active ? (
                  <span className="absolute inset-y-2 right-0 w-1 rounded-l-full bg-shah-gold-400 dark:bg-shah-lapis-900" />
                ) : null}

                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-xl transition ${
                    active
                      ? "bg-white/12 text-shah-gold-200 dark:bg-shah-black-950/10 dark:text-shah-black-950"
                      : "bg-shah-gold-500/8 text-shah-gold-700 group-hover:bg-shah-gold-500/14 dark:text-shah-gold-200"
                  }`}
                >
                  <Icon className="size-4.5" aria-hidden />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">
                    {item.label}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-[11px] font-bold ${
                      active
                        ? "text-white/62 dark:text-shah-black-950/62"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-shah-gold-500/10 p-3 dark:border-white/8">
        <div className="flex items-center gap-2 rounded-2xl border border-shah-gold-500/10 bg-white/58 p-2 shadow-inner shadow-white/20 dark:border-white/8 dark:bg-white/4 dark:shadow-none">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-shah-gold-500/12 text-sm font-black text-shah-gold-800 dark:text-shah-gold-200">
            A
          </div>

          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-black text-foreground dark:text-white">
              امیرحسین
            </span>
            <span className="mt-0.5 block truncate text-[11px] font-bold text-muted-foreground">
              مدیر سیستم
            </span>
          </div>

          <form action="/admin/logout" method="post">
            <button
              className="grid size-9 place-items-center rounded-xl text-foreground/60 transition hover:bg-red-500/10 hover:text-red-700 dark:text-zinc-300 dark:hover:text-red-200"
              title="خروج"
              type="submit"
            >
              <FiLogOut className="size-4" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-shah-gold-500/10 bg-white/82 px-3 py-3 shadow-lg shadow-shah-black-900/5 backdrop-blur-2xl lg:hidden dark:border-white/10 dark:bg-[#0f0f10]/90">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link
          href="/admin"
          className="flex min-w-0 items-center gap-2 rounded-2xl text-foreground dark:text-white"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-shah-lapis-900 text-sm font-black text-shah-gold-200 dark:bg-shah-gold-500 dark:text-shah-black-950">
            ش
          </span>

          <span className="min-w-0">
            <span className="block truncate text-base font-black">
              پنل مدیریت
            </span>
            <span className="block truncate text-[11px] font-bold text-muted-foreground">
              Shahname Admin
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <div className="w-28">
            <AdminThemeToggle />
          </div>

          <form action="/admin/logout" method="post">
            <button
              className="grid size-10 place-items-center rounded-xl border border-shah-gold-500/10 bg-white/58 text-foreground/70 transition hover:bg-red-500/10 hover:text-red-700 dark:border-white/8 dark:bg-white/4.5 dark:text-zinc-300 dark:hover:text-red-200"
              title="خروج"
              type="submit"
            >
              <FiLogOut className="size-4" aria-hidden />
            </button>
          </form>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {menuItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-black transition-all duration-200 ${
                active
                  ? "bg-shah-lapis-900 text-shah-gold-100 shadow-md shadow-shah-lapis-900/15 dark:bg-shah-gold-500 dark:text-shah-black-950"
                  : "border border-shah-gold-500/10 bg-white/58 text-foreground/78 hover:bg-shah-gold-500/8 hover:text-foreground dark:border-white/8 dark:bg-white/4.5 dark:text-zinc-300 dark:hover:bg-white/7.5 dark:hover:text-white"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
