"use client";

import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

type LightboxViewerProps = {
  close: () => void;
  index?: number;
  open: boolean;
  slides: Array<{ alt?: string; src: string }>;
};

export function LightboxViewer({
  close,
  index = 0,
  open,
  slides,
}: LightboxViewerProps) {
  return (
    <Lightbox
      open={open}
      close={close}
      index={index}
      slides={slides}
      plugins={[Fullscreen, Zoom]}
      carousel={{ finite: true }}
      controller={{ closeOnBackdropClick: true }}
      zoom={{
        maxZoomPixelRatio: 4,
        scrollToZoom: true,
      }}
    />
  );
}
