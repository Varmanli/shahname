import type { Story } from "@/types/story";

const WORDS_PER_MINUTE = 170;

export function calculateReadingTime(content: string | null | undefined) {
  const text = String(content ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-zA-Z0-9#]+;/g, " ")
    .replace(/[#*_>`~\[\](){}.!؟،؛:;"“”'«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return 1;

  const words = text.split(" ").filter(Boolean).length;

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function calculateStoryReadingTime(story: Pick<Story, "content" | "quote" | "sections" | "shortDescription" | "subtitle" | "title">) {
  const fullText = [
    story.content,
    ...story.sections.map((section) => section.content),
  ]
    .filter(Boolean)
    .join(" ");

  if (fullText.trim()) return calculateReadingTime(fullText);

  return calculateReadingTime(
    [story.title, story.subtitle, story.shortDescription, story.quote]
      .filter(Boolean)
      .join(" "),
  );
}

export function formatReadingTimeFa(minutes: number) {
  return `حدود ${minutes.toLocaleString("fa-IR")} دقیقه مطالعه`;
}
