"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const savedTheme = window.localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.dataset.theme = theme;
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("themechange", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("themechange", callback);
  };
}

function getServerTheme(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getInitialTheme,
    getServerTheme,
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.10)] transition-all duration-500 hover:border-shah-gold-400/60 hover:bg-shah-gold-50 hover:text-shah-gold-700 hover:shadow-[0_8px_24px_rgba(246,184,31,0.20)] focus:outline-none focus-visible:ring-2 focus-visible:ring-shah-gold-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/10 dark:bg-white/5 dark:text-shah-cream-100 dark:shadow-none dark:hover:border-shah-gold-400/50 dark:hover:bg-white/10 dark:hover:text-shah-gold-300 dark:focus-visible:ring-offset-zinc-950"
      aria-label={
        theme === "dark" ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"
      }
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-br from-white via-shah-gold-50/70 to-shah-gold-100/60 opacity-100 transition-opacity duration-500 dark:from-white/10 dark:via-white/5 dark:to-transparent dark:opacity-0" />

      <span className="pointer-events-none absolute -right-2 -top-2 h-8 w-8 rounded-full bg-shah-gold-300/20 blur-xl transition-all duration-500 group-hover:bg-shah-gold-300/35 dark:bg-shah-gold-400/0 dark:group-hover:bg-shah-gold-400/15" />

      <div className="relative z-10 h-5 w-5 overflow-hidden">
        {/* Sun icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`absolute inset-0 transform transition-all duration-500 ${
            theme === "dark"
              ? "translate-y-0 rotate-0 opacity-100"
              : "translate-y-10 rotate-90 opacity-0"
          } text-shah-gold-400 dark:text-shah-gold-300`}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>

        {/* Moon icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`absolute inset-0 transform transition-all duration-500 ${
            theme === "light"
              ? "translate-y-0 rotate-0 opacity-100"
              : "-translate-y-10 -rotate-90 opacity-0"
          } text-slate-700 dark:text-shah-cream-100`}
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </div>

      <span className="pointer-events-none absolute inset-0 rounded-full bg-shah-gold-400/0 transition-all duration-300 group-hover:bg-shah-gold-400/10 group-hover:blur-md" />
    </button>
  );
}
