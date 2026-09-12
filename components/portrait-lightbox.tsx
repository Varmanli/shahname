"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

import { shouldUseUnoptimizedImage } from "@/lib/images";

const LightboxViewer = dynamic(
  () =>
    import("@/components/lightbox-viewer").then(
      (module) => module.LightboxViewer,
    ),
  { ssr: false },
);

type PortraitLightboxProps = {
  alt: string;
  className: string;
  imageClassName: string;
  src: string;
};

export function PortraitLightbox({
  alt,
  className,
  imageClassName,
  src,
}: PortraitLightboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        aria-label={`${alt} را تمام‌صفحه باز کن`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={imageClassName}
          unoptimized={shouldUseUnoptimizedImage(src)}
        />
      </button>

      {open ? (
        <LightboxViewer
          open={open}
          close={() => setOpen(false)}
          slides={[{ src, alt }]}
        />
      ) : null}
    </>
  );
}
