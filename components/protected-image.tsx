"use client";

import Image from "next/image";
import type { ComponentProps } from "react";

type ProtectedImageProps = ComponentProps<typeof Image>;

export function ProtectedImage(props: ProtectedImageProps) {
  const { alt, ...imageProps } = props;

  return (
    <Image
      {...imageProps}
      alt={alt}
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    />
  );
}
