"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
} from "react-icons/fi";
import useEmblaCarousel from "embla-carousel-react";

import { cn } from "@/lib/utils";
import type { HomeHeroSlide } from "@/types/home-hero-slide";

type HomeHeroSliderProps = {
  slides: HomeHeroSlide[];
};

export function HomeHeroSlider({ slides }: HomeHeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    loop: slides.length > 1,
    align: "start",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const syncState = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
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

  if (!slides.length) return null;

  return (
    <section className="relative isolate overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.18),transparent_30%)]" />

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <HeroSlide
              key={slide.id}
              index={index}
              slide={slide}
              priority={index === 0}
            />
          ))}
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <HeroArrow
            direction="next"
            disabled={!canScrollNext}
            onClick={() => emblaApi?.scrollNext()}
          />

          <HeroArrow
            direction="prev"
            disabled={!canScrollPrev}
            onClick={() => emblaApi?.scrollPrev()}
          />

          <HeroDots
            selectedIndex={selectedIndex}
            slides={slides}
            onSelect={(index) => emblaApi?.scrollTo(index)}
          />
        </>
      ) : null}
    </section>
  );
}

function HeroSlide({
  priority,
  slide,
}: {
  index: number;
  priority: boolean;
  slide: HomeHeroSlide;
}) {
  const isRight = slide.contentPosition === "right";

  return (
    <div className="relative min-w-0 flex-[0_0_100%]">
      <div className="relative flex min-h-110 items-stretch overflow-hidden px-4 py-5 sm:min-h-125 sm:px-6 md:min-h-170 md:px-8 md:py-8 lg:h-screen lg:min-h-180 lg:px-10 lg:py-10">
        <div className="absolute inset-0">
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={priority}
            sizes="100vw"
            className="scale-[1.02] object-cover"
            unoptimized={slide.image.startsWith("/uploads/")}
          />
        </div>

        <div className="absolute inset-0 bg-black/38" />

        <div
          className={cn(
            "absolute inset-0",
            isRight
              ? "bg-linear-to-l from-black/82 via-black/48 to-black/12"
              : "bg-linear-to-r from-black/82 via-black/48 to-black/12",
          )}
        />

        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#050505] via-[#050505]/70 to-transparent" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] bg-size-[72px_72px]" />

        <div className="relative z-10 mx-auto grid w-full max-w-384 items-center px-4 md:grid-cols-2">
          <div
            className={cn(
              "mx-auto flex max-w-2xl flex-col items-center self-center pb-14 text-center md:pb-0",
              isRight ? "md:col-start-2" : "md:col-start-1",
            )}
          >
            <h1 className="mx-auto mt-5 max-w-2xl text-center text-3xl font-black leading-tight tracking-tight text-white drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-5xl">
              {slide.title}
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-center text-sm font-bold leading-8 text-white/78 drop-shadow md:text-base md:leading-9">
              {slide.subtitle}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={slide.primaryButtonHref}
                className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-shah-gold-500 px-5 text-sm font-black text-shah-black-950 shadow-[0_18px_45px_rgba(212,175,55,0.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-shah-gold-400 hover:shadow-[0_22px_55px_rgba(212,175,55,0.34)] active:scale-95"
              >
                <span className="absolute inset-0 translate-x-full bg-linear-to-l from-white/0 via-white/35 to-white/0 transition duration-700 group-hover:-translate-x-full" />

                <span className="relative grid size-7 place-items-center rounded-xl bg-shah-black-950/10 text-shah-black-950 transition group-hover:bg-shah-black-950/14">
                  <FiCompass aria-hidden className="size-3.5" />
                </span>

                <span className="relative">{slide.primaryButtonLabel}</span>

                <FiArrowLeft
                  aria-hidden
                  className="relative size-4 opacity-70 transition duration-200 group-hover:-translate-x-0.5 group-hover:opacity-100"
                />
              </Link>

              {slide.secondaryButtonLabel && slide.secondaryButtonHref ? (
                <Link
                  href={slide.secondaryButtonHref}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/18 bg-white/8 px-5 text-sm font-black text-white shadow-lg shadow-black/15 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-shah-gold-400/38 hover:bg-white/14 active:scale-95"
                >
                  <span className="grid size-7 place-items-center rounded-xl border border-white/12 bg-white/8 text-shah-gold-200 transition group-hover:border-shah-gold-400/28 group-hover:bg-shah-gold-400/12">
                    <FiArrowLeft
                      aria-hidden
                      className="size-3.5 transition duration-200 group-hover:-translate-x-0.5"
                    />
                  </span>

                  <span>{slide.secondaryButtonLabel}</span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroArrow({
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
    direction === "next" ? "right-4 md:right-8" : "left-4 md:left-8";

  return (
    <button
      type="button"
      aria-label={direction === "next" ? "اسلاید بعدی" : "اسلاید قبلی"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "absolute top-1/2 z-30 hidden size-12 -translate-y-1/2 place-items-center rounded-full border backdrop-blur-2xl transition duration-200 md:grid",
        positionClass,
        disabled
          ? "cursor-not-allowed border-white/8 bg-black/18 text-white/24"
          : "border-white/14 bg-black/32 text-white shadow-xl shadow-black/25 hover:-translate-y-[calc(50%+2px)] hover:border-shah-gold-400/35 hover:bg-shah-gold-500 hover:text-shah-black-950",
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}

function HeroDots({
  onSelect,
  selectedIndex,
  slides,
}: {
  onSelect: (index: number) => void;
  selectedIndex: number;
  slides: HomeHeroSlide[];
}) {
  return (
    <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center px-4 md:bottom-8">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/34 px-3 py-2 shadow-xl shadow-black/20 backdrop-blur-2xl">
        {slides.map((slide, index) => {
          const active = index === selectedIndex;

          return (
            <button
              key={slide.id}
              type="button"
              aria-label={`رفتن به اسلاید ${index + 1}`}
              onClick={() => onSelect(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                active
                  ? "w-7 bg-shah-gold-400 shadow-[0_0_18px_rgba(212,175,55,0.65)]"
                  : "w-2 bg-white/38 hover:bg-white/70",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
