"use client";

import Image from "next/image";
import Link from "next/link";
import { FocusEvent, MouseEvent, ReactNode, useMemo, useState } from "react";
import parse, {
  DOMNode,
  Element,
  HTMLReactParserOptions,
  domToReact,
} from "html-react-parser";

import {
  linkCharacterNamesInHtml,
  type StoryCharacterLinkData,
} from "@/lib/story-character-links";
import { shouldUseUnoptimizedImage } from "@/lib/images";

type StoryRichTextProps = {
  characters: StoryCharacterLinkData[];
  className?: string;
  html: string;
};

type HoverPreview = {
  slug: string;
  x: number;
  y: number;
};

export function StoryRichText({
  characters,
  className,
  html,
}: StoryRichTextProps) {
  const [hoverPreview, setHoverPreview] = useState<HoverPreview | null>(null);

  const characterBySlug = useMemo(
    () => new Map(characters.map((character) => [character.slug, character])),
    [characters],
  );

  const linkedHtml = useMemo(
    () => linkCharacterNamesInHtml(html, characters),
    [characters, html],
  );

  const parsedContent = useMemo(() => parseStoryHtml(linkedHtml), [linkedHtml]);

  const previewCharacter = hoverPreview
    ? characterBySlug.get(hoverPreview.slug)
    : undefined;

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-story-character]",
    );

    if (!trigger) {
      setHoverPreview(null);
      return;
    }

    const slug = trigger.dataset.storyCharacter;
    if (!slug) return;

    showPreviewAt(slug, event.clientX + 16, event.clientY + 16);
  }

  function handleFocus(event: FocusEvent<HTMLElement>) {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-story-character]",
    );

    const slug = trigger?.dataset.storyCharacter;
    if (!slug) return;

    const rect = trigger.getBoundingClientRect();
    showPreviewAt(slug, rect.left, rect.bottom + 12);
  }

  function showPreviewAt(slug: string, rawX: number, rawY: number) {
    const previewWidth = 300;
    const previewHeight = 190;
    const gap = 16;

    const x = Math.min(
      Math.max(gap, rawX),
      Math.max(gap, window.innerWidth - previewWidth - gap),
    );

    const y =
      rawY + previewHeight > window.innerHeight - gap
        ? Math.max(gap, rawY - previewHeight - gap * 2)
        : Math.max(gap, rawY);

    setHoverPreview({ slug, x, y });
  }

  return (
    <>
      <article
        className={className}
        onBlur={() => setHoverPreview(null)}
        onFocus={handleFocus}
        onMouseLeave={() => setHoverPreview(null)}
        onMouseMove={handleMouseMove}
      >
        {parsedContent}
      </article>

      {hoverPreview && previewCharacter ? (
        <div
          className="pointer-events-none fixed z-90 w-74 rounded-[1.35rem] border border-shah-gold-500/22 bg-white/95 p-4 text-right shadow-2xl shadow-black/18 backdrop-blur-xl dark:border-white/10 dark:bg-[#101010]/95"
          style={{ left: hoverPreview.x, top: hoverPreview.y }}
          role="tooltip"
        >
          <div className="flex items-center gap-3">
            <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-sm bg-shah-lapis-900 text-base font-black text-shah-gold-200">
              {previewCharacter.avatar ? (
                <Image
                  src={previewCharacter.avatar}
                  alt={previewCharacter.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized={shouldUseUnoptimizedImage(previewCharacter.avatar)}
                />
              ) : (
                previewCharacter.name.slice(0, 1)
              )}
            </span>

            <span className="min-w-0">
              <strong className="block truncate text-base font-black text-shah-black-950 dark:text-white">
                {previewCharacter.name}
              </strong>

              <span className="mt-1 block truncate text-xs font-black text-shah-gold-700 dark:text-shah-gold-300">
                {previewCharacter.title ||
                  previewCharacter.role ||
                  "شخصیت شاهنامه"}
              </span>
            </span>
          </div>

          {previewCharacter.description ? (
            <p className="mt-3 line-clamp-3 text-xs font-semibold leading-6 text-muted-foreground">
              {stripHtml(previewCharacter.description)}
            </p>
          ) : null}

          <p className="mt-3 text-[11px] font-black text-shah-lapis-800 dark:text-shah-gold-200">
            برای صفحه شخصیت، روی نام کلیک کنید
          </p>
        </div>
      ) : null}
    </>
  );
}

function parseStoryHtml(html: string): ReactNode {
  const options: HTMLReactParserOptions = {
    replace(node) {
      if (!(node instanceof Element)) return;

      if (node.name === "a" && node.attribs?.["data-story-character"]) {
        const slug = node.attribs["data-story-character"];
        const className = ["story-character-link", node.attribs.class]
          .filter(Boolean)
          .join(" ");

        return (
          <Link
            href={`/characters/${encodeURIComponent(slug)}`}
            data-story-character={slug}
            className={className}
          >
            {domToReact(node.children as DOMNode[], options)}
          </Link>
        );
      }

      return undefined;
    },
  };

  return parse(html, options);
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
