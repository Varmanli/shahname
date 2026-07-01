"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

type MediaLightboxItem = {
  alt: string;
  label: string;
  src: string;
};

type MediaLightboxGalleryProps = {
  images: MediaLightboxItem[];
};

export function MediaLightboxGallery({ images }: MediaLightboxGalleryProps) {
  const [index, setIndex] = useState(-1);

  if (!images.length) return null;

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {images.map((image, imageIndex) => (
          <button
            type="button"
            key={`${image.src}-${imageIndex}`}
            onClick={() => setIndex(imageIndex)}
            className="group relative aspect-video overflow-hidden rounded-2xl border border-shah-gold-500/25 bg-shah-cream-100 text-right shadow-[0_12px_30px_rgba(26,26,26,0.08)] transition hover:border-shah-gold-500/60 focus:outline-none focus:ring-2 focus:ring-shah-gold-400 dark:border-shah-gold-500/20 dark:bg-zinc-950 dark:shadow-none"
            aria-label={`${image.label} را تمام‌صفحه باز کن`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-80" />
            <span className="absolute bottom-4 right-4 text-sm font-black text-white">
              {image.label}
            </span>
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={images.map((image) => ({
          src: image.src,
          alt: image.alt,
        }))}
        plugins={[Fullscreen, Zoom]}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
        zoom={{
          maxZoomPixelRatio: 4,
          scrollToZoom: true,
        }}
      />
    </>
  );
}
