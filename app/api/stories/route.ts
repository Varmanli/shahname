import {
  createStory,
  createStorySlug,
  readStories,
} from "@/lib/story-store";
import {
  parseArchiveParams,
  searchStoriesArchive,
  type StorySort,
} from "@/lib/archive-search";
import { saveUploadedImage } from "@/lib/upload-parser";
import { requireAdminRequest } from "@/lib/admin-auth";
import type {
  StoryCharacterReference,
  StoryInput,
  StorySection,
} from "@/types/story";

export const dynamic = "force-dynamic";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function file(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function parseJsonArray<T>(value: string, fallback: T[] = []) {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

async function sectionsWithUploadedImages(
  formData: FormData,
  sections: StorySection[],
) {
  return Promise.all(
    sections.map(async (section) => {
      const image = file(formData, `sectionImage:${section.id}`);

      return {
        ...section,
        image: image ? await saveUploadedImage(image) : section.image || undefined,
      };
    }),
  );
}

async function toStoryInput(
  formData: FormData,
  coverImage: string,
): Promise<StoryInput> {
  const title = text(formData, "title");
  const submittedSlug = text(formData, "slug");
  const sections = parseJsonArray<StorySection>(text(formData, "sections")).filter(
    (section) => section.title.trim() || section.content.trim(),
  );

  return {
    title,
    slug: submittedSlug || createStorySlug(title),
    subtitle: text(formData, "subtitle"),
    shortDescription: text(formData, "shortDescription"),
    content: text(formData, "content"),
    sections: await sectionsWithUploadedImages(formData, sections),
    characters: parseJsonArray<StoryCharacterReference>(
      text(formData, "characters"),
    ).filter((character) => character.name.trim() && character.slug.trim()),
    coverImage,
    scenes: [],
    quote: text(formData, "quote"),
    order: Number(text(formData, "order")) || 0,
  };
}

async function validateStory(input: StoryInput) {
  if (!input.title || !input.slug) return "عنوان داستان الزامی است.";
  if (!input.subtitle) return "زیرعنوان داستان الزامی است.";
  if (!input.shortDescription) return "خلاصه کوتاه داستان الزامی است.";
  if (!input.sections.length) return "حداقل یک بخش برای داستان ثبت کنید.";
  if (!input.characters.length) return "حداقل یک شخصیت به داستان پیوند دهید.";
  if (!input.coverImage) return "تصویر کاور داستان الزامی است.";

  const stories = await readStories();
  if (stories.some((story) => story.slug === input.slug)) {
    return "داستانی با این عنوان قبلا ثبت شده است.";
  }

  return null;
}

export async function GET(request: Request) {
  const stories = await readStories();
  const parsed = parseArchiveParams(new URL(request.url).searchParams);
  const hasSearchParams = new URL(request.url).searchParams.size > 0;

  if (!hasSearchParams) {
    return Response.json({ stories });
  }

  const result = searchStoriesArchive(stories, {
    character: parsed.character,
    cursor: parsed.cursor,
    era: parsed.era,
    length: parsed.length,
    page: parsed.page,
    search: parsed.search,
    sort: ["newest", "popular", "reading-time"].includes(parsed.sort)
      ? (parsed.sort as StorySort)
      : "newest",
    theme: parsed.theme,
  });

  return Response.json({
    didYouMean: result.didYouMean,
    hasNextPage: result.hasNextPage,
    matches: result.matches,
    nextCursor: result.nextCursor,
    page: result.page,
    pageSize: result.pageSize,
    relatedResults: result.relatedResults,
    stories: result.items,
    total: result.total,
    totalPages: result.totalPages,
  });
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const formData = await request.formData();
    const cover = file(formData, "coverImage");
    const coverImage = cover
      ? await saveUploadedImage(cover)
      : text(formData, "coverImageUrl");
    const input = await toStoryInput(formData, coverImage);
    const error = await validateStory(input);

    if (error) return Response.json({ message: error }, { status: 400 });

    const story = await createStory(input);
    return Response.json({ story }, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "خطای ناشناخته رخ داد." },
      { status: 500 },
    );
  }
}
