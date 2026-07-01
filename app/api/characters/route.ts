import {
  createCharacter,
  createCharacterSlug,
  readCharacters,
} from "@/lib/character-store";
import {
  parseArchiveParams,
  searchCharactersArchive,
  type CharacterSort,
} from "@/lib/archive-search";
import { validateCharacterRelations } from "@/lib/character-relations";
import { normalizeCharacterTraits } from "@/lib/traits";
import { saveUploadedImage } from "@/lib/upload-parser";
import { requireAdminRequest } from "@/lib/admin-auth";
import { readLineages } from "@/lib/lineage-store";
import type { CharacterInput } from "@/types/character";

export const dynamic = "force-dynamic";

function text(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function file(formData: FormData, key: string) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

function list(formData: FormData, key: string) {
  const value = text(formData, key);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function optionalText(formData: FormData, key: string) {
  return text(formData, key) || undefined;
}

function traits(formData: FormData, key: string) {
  const value = text(formData, key);

  if (!value) {
    return [];
  }

  try {
    return normalizeCharacterTraits(JSON.parse(value));
  } catch {
    return normalizeCharacterTraits(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }
}

function richTextHasContent(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim().length > 0;
}

function toCharacterInput(
  formData: FormData,
  portraitImage: string,
  sceneImage: string,
): CharacterInput {
  const name = text(formData, "name");
  const submittedSlug = text(formData, "slug");

  return {
    name,
    slug: submittedSlug || createCharacterSlug(name),
    title: text(formData, "title"),
    epithets: list(formData, "epithets"),
    role: text(formData, "role"),
    visualRole: optionalText(formData, "visualRole") as CharacterInput["visualRole"],
    nationality: text(formData, "nationality"),
    nameMeaning: text(formData, "nameMeaning"),
    father: text(formData, "father") || undefined,
    mother: text(formData, "mother") || undefined,
    fatherId: optionalText(formData, "fatherId"),
    motherId: optionalText(formData, "motherId"),
    spouseIds: list(formData, "spouseIds"),
    childrenIds: list(formData, "childrenIds"),
    siblingIds: list(formData, "siblingIds"),
    relations: [],
    dynasty: text(formData, "dynasty"),
    lineageGroup: text(formData, "lineageGroup") || text(formData, "dynasty"),
    lineageId: optionalText(formData, "lineageId"),
    enemies: list(formData, "enemies"),
    shortDescription: text(formData, "shortDescription"),
    fullDescription: text(formData, "fullDescription"),
    traits: traits(formData, "traits"),
    achievements: list(formData, "achievements"),
    quote: text(formData, "quote"),
    portraitImage,
    sceneImage,
  };
}

async function validateCharacter(input: CharacterInput) {
  if (!input.name) {
    return "نام شخصیت الزامی است.";
  }

  if (!input.slug) {
    return "نام شخصیت برای ساخت مسیر الزامی است.";
  }

  if (!input.title || !input.role || !input.dynasty) {
    return "عنوان، نقش و دودمان الزامی هستند.";
  }

  if (
    !richTextHasContent(input.shortDescription) ||
    !richTextHasContent(input.fullDescription)
  ) {
    return "خلاصه و روایت کامل شخصیت الزامی هستند.";
  }

  if (!input.portraitImage) {
    return "عکس پرتره الزامی است.";
  }

  if (!input.sceneImage) {
    return "عکس صحنه الزامی است.";
  }

  const characters = await readCharacters();
  if (characters.some((character) => character.slug === input.slug)) {
    return "شخصیتی با این نام قبلا ثبت شده است.";
  }

  const relationError = validateCharacterRelations(input, characters);
  if (relationError) {
    return relationError;
  }

  if (input.lineageId) {
    const lineages = await readLineages();
    if (!lineages.some((lineage) => lineage.id === input.lineageId)) {
      return "تبارنامه انتخاب‌شده معتبر نیست.";
    }
  }

  return null;
}

export async function GET(request: Request) {
  const characters = await readCharacters();
  const parsed = parseArchiveParams(new URL(request.url).searchParams);
  const hasSearchParams = new URL(request.url).searchParams.size > 0;

  if (!hasSearchParams) {
    return Response.json({ characters });
  }

  const result = searchCharactersArchive(characters, {
    cursor: parsed.cursor,
    dynasty: parsed.dynasty,
    era: parsed.era,
    nationality: parsed.nationality,
    page: parsed.page,
    role: parsed.role,
    search: parsed.search,
    sort: ["featured", "newest", "alphabetic"].includes(parsed.sort)
      ? (parsed.sort as CharacterSort)
      : "featured",
  });

  return Response.json({
    characters: result.items,
    didYouMean: result.didYouMean,
    hasNextPage: result.hasNextPage,
    matches: result.matches,
    nextCursor: result.nextCursor,
    page: result.page,
    pageSize: result.pageSize,
    relatedResults: result.relatedResults,
    total: result.total,
    totalPages: result.totalPages,
  });
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const formData = await request.formData();
    const portrait = file(formData, "portraitImage");
    const scene = file(formData, "sceneImage");
    const portraitImage = portrait
      ? await saveUploadedImage(portrait)
      : text(formData, "portraitImageUrl");
    const sceneImage = scene
      ? await saveUploadedImage(scene)
      : text(formData, "sceneImageUrl");
    const input = toCharacterInput(formData, portraitImage, sceneImage);
    const error = await validateCharacter(input);

    if (error) {
      return Response.json({ message: error }, { status: 400 });
    }

    const character = await createCharacter(input);

    return Response.json({ character }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "خطای ناشناخته رخ داد.",
      },
      { status: 500 },
    );
  }
}
