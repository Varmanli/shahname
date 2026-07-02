"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiSearch, FiX, FiChevronLeft } from "react-icons/fi";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { name: "خانه", href: "/" },
  { name: "داستان‌ها", href: "/stories" },
  { name: "شخصیت‌ها", href: "/characters" },
  { name: "تبارنامه‌ها", href: "/lineage" },
  { name: "درباره شاهنامه", href: "/about" },
  { name: "تماس با ما", href: "/contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // افکت تشخیص اسکرول برای تغییر ظاهر هدر
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function isActivePath(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      dir="rtl"
      className={`fixed inset-x-0 z-50 flex w-full justify-center px-4 transition-all duration-500 ${
        scrolled ? "top-3 py-2" : "top-0 py-3"
      }`}
    >
      {/* بدنه اصلی هدر - Glassmorphism Container */}
      <div
        className={`relative flex w-full max-w-7xl items-center justify-between gap-4 rounded-[1.75rem] border px-5 py-3 transition-all duration-500 sm:px-6 ${
          scrolled
            ? "border-shah-gold-400/18 bg-card/88 shadow-[0_22px_55px_rgba(0,0,0,0.24)] backdrop-blur-2xl dark:shadow-[0_22px_55px_rgba(0,0,0,0.48)]"
            : "border-border bg-card/72 shadow-[0_16px_42px_rgba(0,0,0,0.16)] backdrop-blur-xl dark:shadow-[0_16px_42px_rgba(0,0,0,0.34)]"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-shah-gold-300/45 to-transparent" />
        <div className="pointer-events-none absolute -right-20 top-1/2 h-24 w-56 -translate-y-1/2 rounded-full bg-shah-gold-400/10 blur-3xl" />
        {/* Logo Section */}
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="relative rounded-full bg-foreground/6 px-3 py-1.5 text-xl font-black tracking-tight text-foreground ring-1 ring-foreground/10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)] transition group-hover:text-shah-gold-500 dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] dark:group-hover:text-shah-gold-200 sm:text-2xl">
            شاهنامه<span className="text-shah-gold-400">‌سرا</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-x-2 lg:flex">
          {navItems.map((item) => {
            const isActive = isActivePath(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "text-accent"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                <span className="relative z-10 drop-shadow-[0_1px_8px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute inset-0 z-0 rounded-full bg-shah-gold-400/14 ring-1 ring-shah-gold-400/28 shadow-[0_0_22px_rgba(246,184,31,0.16)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-foreground/8 p-1.5 ring-1 ring-foreground/10 backdrop-blur-md">
            <ThemeToggle />
            <div className="h-4 w-px bg-foreground/10" />
            <Link
              href="/search"
              aria-label="جستجو"
              className="group flex h-9 w-9 items-center justify-center rounded-full text-foreground/75 transition-all hover:bg-shah-gold-400 hover:text-[#071426]"
            >
              <FiSearch className="h-5 w-5 transition-transform group-hover:scale-110" />
            </Link>
          </div>

          {/* Toggle Mobile Menu */}
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "بستن منوی اصلی" : "باز کردن منوی اصلی"}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all lg:hidden ${
              isOpen
                ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/20"
                : "bg-shah-gold-400 text-[#071426] shadow-[0_0_15px_rgba(246,184,31,0.3)] hover:scale-105"
            }`}
          >
            {isOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`absolute inset-x-0 top-[calc(100%+1rem)] z-50 origin-top transform transition-all duration-500 lg:hidden ${
            isOpen
              ? "scale-y-100 opacity-100 translate-y-0"
              : "scale-y-95 opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden rounded-[2.5rem] border border-border bg-card/95 p-4 shadow-[0_40px_80px_rgba(0,0,0,0.25)] backdrop-blur-3xl dark:shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
            {/* Nav Links */}
            <nav className="grid gap-2">
              {navItems.map((item, index) => {
                const isActive = isActivePath(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    style={{ transitionDelay: `${index * 50}ms` }}
                    className={`group flex items-center justify-between rounded-2xl px-5 py-4 transition-all ${
                      isActive
                        ? "bg-shah-gold-400 text-[#071426] font-black"
                        : "text-foreground/70 hover:bg-foreground/5 hover:pr-7"
                    }`}
                  >
                    <span className="text-sm">{item.name}</span>
                    <FiChevronLeft
                      className={`h-5 w-5 transition-transform ${isActive ? "rotate-90" : "group-hover:-translate-x-1"}`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Decoration */}
            <div className="mt-4 flex justify-center py-2">
              <div className="h-1 w-12 rounded-full bg-foreground/10" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
