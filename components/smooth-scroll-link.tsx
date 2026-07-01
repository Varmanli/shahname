"use client";

import type { ReactNode } from "react";

type SmoothScrollLinkProps = {
  children: ReactNode;
  className?: string;
  href: `#${string}`;
};

export function SmoothScrollLink({
  children,
  className,
  href,
}: SmoothScrollLinkProps) {
  return (
    <a
      className={className}
      href={href}
      onClick={(event) => {
        const target = document.getElementById(href.slice(1));

        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", href);
      }}
    >
      {children}
    </a>
  );
}
