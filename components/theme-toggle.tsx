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
      onClick={toggleTheme}
      className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-500 hover:border-shah-gold-400/50 hover:bg-white/10 focus:outline-none"
      aria-label={
        theme === "dark" ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"
      }
    >
      <div className="relative h-5 w-5 overflow-hidden">
        {/* آیکون خورشید */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`absolute inset-0 transform transition-all duration-500 ${
            theme === "dark"
              ? "translate-y-0 rotate-0 opacity-100"
              : "translate-y-10 rotate-90 opacity-0"
          } text-shah-gold-300`}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>

        {/* آیکون ماه */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`absolute inset-0 transform transition-all duration-500 ${
            theme === "light"
              ? "translate-y-0 rotate-0 opacity-100"
              : "-translate-y-10 -rotate-90 opacity-0"
          } text-shah-cream-100`}
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </div>

      {/* هاله نوری پشت آیکون هنگام هوور */}
      <span className="absolute inset-0 rounded-full bg-shah-gold-400/0 transition-all duration-300 group-hover:bg-shah-gold-400/10 group-hover:blur-md" />
    </button>
  );
}
