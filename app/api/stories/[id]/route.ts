import {
  createStorySlug,
  deleteStory,
  readStories,
  updateStory,
} from "@/lib/story-store";
import { saveUploadedImage } from "@/lib/upload-parser";
import { requireAdminRequest } from "@/lib/admin-auth";
import type {
  Story,
  StoryCharacterReference,
  StoryInput,
  StorySection,
} from "@/types/story";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function text(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
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
  existing: Story,
  coverImage: string,
): Promise<StoryInput> {
  const removeCoverImage = formData.get("removeCoverImage") === "true";
  const title = text(formData, "title", existing.title);
  const submittedSlug = text(formData, "slug", existing.slug);
  const sections = parseJsonArray<StorySection>(
    text(formData, "sections"),
    existing.sections,
  ).filter((section) => section.title.trim() || section.content.trim());

  return {
    title,
    slug: submittedSlug || createStorySlug(title),
    subtitle: text(formData, "subtitle", existing.subtitle),
    shortDescription: text(
      formData,
      "shortDescription",
      existing.shortDescription,
    ),
    content: text(formData, "content", existing.content),
    sections: await sectionsWithUploadedImages(formData, sections),
    characters: parseJsonArray<StoryCharacterReference>(
      text(formData, "characters"),
      existing.characters,
    ).filter((character) => character.name.trim() && character.slug.trim()),
    coverImage: removeCoverImage ? "" : coverImage,
    scenes: [],
    quote: text(formData, "quote", existing.quote),
    order: Number(text(formData, "order", String(existing.order))) || 0,
  };
}

function validateStory(input: StoryInput, stories: Story[], id: string) {
  if (!input.title || !input.slug) return "عنوان داستان الزامی است.";
  if (!input.subtitle) return "زیرعنوان داستان الزامی است.";
  if (!input.shortDescription) return "خلاصه کوتاه داستان الزامی است.";
  if (!input.sections.length) return "حداقل یک بخش برای داستان ثبت کنید.";
  if (!input.characters.length) return "حداقل یک شخصیت به داستان پیوند دهید.";
  if (!input.coverImage) return "تصویر کاور داستان الزامی است.";
  if (stories.some((story) => story.id !== id && story.slug === input.slug)) {
    return "داستانی با این عنوان قبلا ثبت شده است.";
  }

  return null;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const { id } = await context.params;
    const stories = await readStories();
    const existing = stories.find((story) => story.id === id);

    if (!existing) {
      return Response.json({ message: "داستان پیدا نشد." }, { status: 404 });
    }

    const formData = await request.formData();
    const cover = file(formData, "coverImage");
    const coverImageUrl = text(formData, "coverImageUrl", "");
    const coverImage = cover
      ? await saveUploadedImage(cover)
      : coverImageUrl || existing.coverImage;
    const input = await toStoryInput(formData, existing, coverImage);
    const error = validateStory(input, stories, id);

    if (error) return Response.json({ message: error }, { status: 400 });

    const story = await updateStory(id, input);
    return Response.json({ story });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "خطای ناشناخته رخ داد." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const { id } = await context.params;
    const deleted = await deleteStory(id);

    if (!deleted) {
      return Response.json({ message: "داستان پیدا نشد." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "خطای ناشناخته رخ داد." },
      { status: 500 },
    );
  }
}
