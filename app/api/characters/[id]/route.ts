import {
  createCharacterSlug,
  deleteCharacter,
  readCharacters,
  updateCharacter,
} from "@/lib/character-store";
import {
  validateCharacterRelations,
  withFamilyRelations,
} from "@/lib/character-relations";
import { normalizeCharacterTraits } from "@/lib/traits";
import { saveUploadedImage } from "@/lib/upload-parser";
import { requireAdminRequest } from "@/lib/admin-auth";
import { readLineages } from "@/lib/lineage-store";
import type { Character, CharacterInput } from "@/types/character";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function text(formData: FormData, key: string, fallback: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : fallback;
}

function file(formData: FormData, key: string) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

function list(formData: FormData, key: string, fallback: string[]) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return fallback;
  }

  if (!value.trim()) {
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

function traits(formData: FormData, key: string, fallback: Character["traits"]) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return fallback;
  }

  if (!value.trim()) {
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

function toCharacterInput(
  formData: FormData,
  existing: Character,
  portraitImage: string,
  sceneImage: string,
): CharacterInput {
  const removePortraitImage = formData.get("removePortraitImage") === "true";
  const removeSceneImage = formData.get("removeSceneImage") === "true";
  const name = text(formData, "name", existing.name);
  const submittedSlug = text(formData, "slug", existing.slug);

  return {
    name,
    slug: submittedSlug || createCharacterSlug(name),
    title: text(formData, "title", existing.title),
    epithets: list(formData, "epithets", existing.epithets),
    role: text(formData, "role", existing.role),
    visualRole: text(
      formData,
      "visualRole",
      existing.visualRole ?? "",
    ) as CharacterInput["visualRole"],
    nationality: text(formData, "nationality", existing.nationality),
    nameMeaning: text(formData, "nameMeaning", existing.nameMeaning),
    father: text(formData, "father", existing.father ?? "") || undefined,
    mother: text(formData, "mother", existing.mother ?? "") || undefined,
    fatherId: text(formData, "fatherId", existing.fatherId ?? "") || undefined,
    motherId: text(formData, "motherId", existing.motherId ?? "") || undefined,
    spouseIds: list(formData, "spouseIds", existing.spouseIds),
    childrenIds: list(formData, "childrenIds", existing.childrenIds),
    siblingIds: list(formData, "siblingIds", existing.siblingIds),
    relations: existing.relations,
    dynasty: text(formData, "dynasty", existing.dynasty),
    lineageGroup: text(
      formData,
      "lineageGroup",
      existing.lineageGroup || existing.dynasty,
    ),
    lineageId: text(formData, "lineageId", existing.lineageId ?? "") || undefined,
    enemies: list(formData, "enemies", existing.enemies),
    shortDescription: text(
      formData,
      "shortDescription",
      existing.shortDescription,
    ),
    fullDescription: text(formData, "fullDescription", existing.fullDescription),
    traits: traits(formData, "traits", existing.traits),
    achievements: list(formData, "achievements", existing.achievements),
    quote: text(formData, "quote", existing.quote),
    portraitImage: removePortraitImage ? "" : portraitImage,
    sceneImage: removeSceneImage ? "" : sceneImage,
  };
}

async function validateCharacter(
  input: CharacterInput,
  characters: Character[],
  id: string,
) {
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
    characters.some(
      (character) => character.id !== id && character.slug === input.slug,
    )
  ) {
    return "شخصیتی با این نام قبلا ثبت شده است.";
  }

  const relationError = validateCharacterRelations(input, characters, id);
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

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const characters = await readCharacters();
  const decodedId = safeDecode(id);
  const character = characters.find(
    (item) => item.id === decodedId || item.slug === decodedId || item.slug === id,
  );

  if (!character) {
    return Response.json({ message: "شخصیت پیدا نشد." }, { status: 404 });
  }

  return Response.json({ character: withFamilyRelations(character, characters) });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const { id } = await context.params;
    const characters = await readCharacters();
    const existing = characters.find((character) => character.id === id);

    if (!existing) {
      return Response.json({ message: "شخصیت پیدا نشد." }, { status: 404 });
    }

    const formData = await request.formData();
    const portrait = file(formData, "portraitImage");
    const scene = file(formData, "sceneImage");
    const portraitImageUrl = text(formData, "portraitImageUrl", "");
    const sceneImageUrl = text(formData, "sceneImageUrl", "");
    const portraitImage = portrait
      ? await saveUploadedImage(portrait)
      : portraitImageUrl || existing.portraitImage;
    const sceneImage = scene
      ? await saveUploadedImage(scene)
      : sceneImageUrl || existing.sceneImage;
    const input = toCharacterInput(formData, existing, portraitImage, sceneImage);
    const error = await validateCharacter(input, characters, id);

    if (error) {
      return Response.json({ message: error }, { status: 400 });
    }

    const character = await updateCharacter(id, input);

    return Response.json({ character });
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

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const { id } = await context.params;
    const deleted = await deleteCharacter(id);

    if (!deleted) {
      return Response.json({ message: "شخصیت پیدا نشد." }, { status: 404 });
    }

    return Response.json({ ok: true });
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
