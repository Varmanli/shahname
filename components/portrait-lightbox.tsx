"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

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
        <Image src={src} alt={alt} fill className={imageClassName} />
      </button>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src, alt }]}
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
