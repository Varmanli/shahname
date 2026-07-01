"use client";

import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type CharacterDetailTab = {
  id: string;
  label: string;
  children: ReactNode;
};

type CharacterDetailTabsProps = {
  tabs: CharacterDetailTab[];
};

export function CharacterDetailTabs({ tabs }: CharacterDetailTabsProps) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    dragged: boolean;
  } | null>(null);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) return null;

  function scrollTabs(direction: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
      dragged: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const delta = event.clientX - drag.startX;

    if (Math.abs(delta) > 4) {
      drag.dragged = true;
    }

    event.currentTarget.scrollLeft = drag.scrollLeft - delta;
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  return (
    <section className="relative grid min-w-0 gap-5">
      <div className="sticky top-22 z-30 min-w-0 rounded-[1.6rem] border border-shah-gold-500/20 bg-white/85 p-2 shadow-2xl shadow-shah-black-900/10 backdrop-blur-xl dark:bg-[#101010]/90 dark:shadow-black/35">
        <div className="relative">
          <button
            type="button"
            aria-label="اسکرول به راست"
            onClick={() => scrollTabs("right")}
            className="absolute right-1 top-1/2 z-20 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-shah-gold-500/20 bg-white/90 text-sm font-black text-shah-gold-800 shadow-lg backdrop-blur transition hover:bg-shah-gold-500 hover:text-white md:grid dark:border-white/10 dark:bg-black/55 dark:text-shah-gold-200 dark:hover:text-black"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="اسکرول به چپ"
            onClick={() => scrollTabs("left")}
            className="absolute left-1 top-1/2 z-20 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-shah-gold-500/20 bg-white/90 text-sm font-black text-shah-gold-800 shadow-lg backdrop-blur transition hover:bg-shah-gold-500 hover:text-white md:grid dark:border-white/10 dark:bg-black/55 dark:text-shah-gold-200 dark:hover:text-black"
          >
            ›
          </button>

          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-linear-to-l from-white/95 to-transparent dark:from-[#101010]/95" />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-linear-to-r from-white/95 to-transparent dark:from-[#101010]/95" />

          <div
            ref={scrollRef}
            className="flex min-w-0 cursor-grab gap-2 overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth p-1 px-11 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {tabs.map((tab) => {
              const active = tab.id === activeTab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (dragRef.current?.dragged) return;
                    setActiveTabId(tab.id);
                  }}
                  className={cn(
                    "relative shrink-0 rounded-[1.15rem] border px-5 py-3 text-sm font-black transition duration-300",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shah-gold-500",
                    active
                      ? "border-shah-gold-500/35 bg-shah-gold-500 text-white shadow-[0_12px_28px_rgba(184,134,11,0.24)] dark:text-black"
                      : "border-transparent text-shah-black-700 hover:border-shah-gold-500/20 hover:bg-shah-gold-500/10 dark:text-zinc-300 dark:hover:text-shah-gold-100",
                  )}
                >
                  {tab.label}

                  {active ? (
                    <span className="absolute inset-x-5 -bottom-1 mx-auto h-1 rounded-full bg-shah-gold-200 dark:bg-shah-gold-950" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        key={activeTab.id}
        className="animate-[character-tab-in_260ms_ease-out]"
      >
        {activeTab.children}
      </div>
    </section>
  );
}
