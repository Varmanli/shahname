"use client";

import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useEmblaCarousel from "embla-carousel-react";

import { cn } from "@/lib/utils";

export type DetailTab<T extends string> = {
  id: T;
  label: string;
};

type DetailTabsSliderProps<T extends string> = {
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: DetailTab<T>[];
};

export function DetailTabsSlider<T extends string>({
  activeTab,
  onTabChange,
  tabs,
}: DetailTabsSliderProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const syncState = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    syncState();
    emblaApi.on("select", syncState);
    emblaApi.on("reInit", syncState);

    return () => {
      emblaApi.off("select", syncState);
      emblaApi.off("reInit", syncState);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (activeIndex !== -1) {
      emblaApi.scrollTo(activeIndex);
    }
  }, [activeTab, emblaApi, tabs]);

  return (
    <div className="sticky top-22 z-30 min-w-0 rounded-[1.35rem] border border-shah-gold-500/18 bg-white/85 p-1.5 shadow-xl shadow-shah-black-900/8 backdrop-blur-xl dark:bg-[#101010]/90 dark:shadow-black/35">
      <div className="relative">
        <CarouselArrow
          direction="next"
          disabled={!canScrollNext}
          onClick={() => emblaApi?.scrollNext()}
        />
        <CarouselArrow
          direction="prev"
          disabled={!canScrollPrev}
          onClick={() => emblaApi?.scrollPrev()}
        />

        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-white/95 to-transparent dark:from-[#101010]/95" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-white/95 to-transparent dark:from-[#101010]/95" />

        <div className="overflow-hidden px-8" ref={emblaRef}>
          <div
            role="tablist"
            aria-label="بخش‌های صفحه شخصیت"
            className="flex min-w-0 gap-1.5 py-1 [touch-action:pan-x_pinch-zoom]"
          >
            {tabs.map((tab) => {
              const active = tab.id === activeTab;

              return (
                <div key={tab.id} className="min-w-0 shrink-0">
                  <button
                    id={`character-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls={`character-tab-panel-${tab.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "relative flex h-10 items-center rounded-[0.95rem] border px-4 text-xs font-black transition duration-300 md:h-11 md:text-[13px]",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shah-gold-500",
                      active
                        ? "border-shah-gold-500/35 bg-shah-gold-500 text-shah-black-950 shadow-[0_10px_22px_rgba(184,134,11,0.2)]"
                        : "border-transparent bg-shah-gold-500/6 text-shah-black-700 hover:border-shah-gold-500/20 hover:bg-shah-gold-500/10 dark:bg-white/[0.035] dark:text-zinc-300 dark:hover:text-shah-gold-100",
                    )}
                  >
                    {tab.label}

                    {active ? (
                      <span className="absolute inset-x-4 -bottom-0.5 mx-auto h-0.5 rounded-full bg-shah-gold-200 dark:bg-shah-gold-950" />
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "next" | "prev";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "next" ? FiChevronRight : FiChevronLeft;
  const positionClass =
    direction === "next"
      ? "right-1 md:right-1.5"
      : "left-1 md:left-1.5";

  return (
    <button
      type="button"
      aria-label={direction === "next" ? "اسلاید بعدی" : "اسلاید قبلی"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "absolute top-1/2 z-20 hidden size-8 -translate-y-1/2 place-items-center rounded-full border text-xs shadow-md backdrop-blur transition md:grid",
        positionClass,
        disabled
          ? "cursor-not-allowed border-shah-gold-500/10 bg-white/70 text-shah-gold-700/35 dark:border-white/8 dark:bg-black/35 dark:text-zinc-500"
          : "border-shah-gold-500/20 bg-white/90 text-shah-gold-800 hover:bg-shah-gold-500 hover:text-shah-black-950 dark:border-white/10 dark:bg-black/55 dark:text-shah-gold-200 dark:hover:text-black",
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
