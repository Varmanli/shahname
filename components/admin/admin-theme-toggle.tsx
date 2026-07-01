"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem("theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

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

export function AdminThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getInitialTheme,
    getServerTheme,
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function setTheme(nextTheme: Theme) {
    applyTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <div
      className="grid w-full grid-cols-2 rounded-2xl border border-zinc-200 bg-zinc-100 p-1 text-xs font-black shadow-inner dark:border-white/10 dark:bg-white/5"
      role="group"
      aria-label="انتخاب حالت نمایش"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`h-10 rounded-xl transition ${
          theme === "light"
            ? "bg-white text-zinc-950 shadow-sm"
            : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        }`}
        aria-pressed={theme === "light"}
      >
        روشن
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`h-10 rounded-xl transition ${
          theme === "dark"
            ? "bg-shah-lapis-900 text-shah-gold-300 shadow-sm"
            : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        }`}
        aria-pressed={theme === "dark"}
      >
        تاریک
      </button>
    </div>
  );
}
