import { requireAdminRequest } from "@/lib/admin-auth";
import { readCharacters, writeCharacters } from "@/lib/character-store";
import { createLineage, readLineages } from "@/lib/lineage-store";
import type { LineageInput } from "@/types/lineage";

export const dynamic = "force-dynamic";

function toLineageInput(payload: Partial<LineageInput>): LineageInput {
  return {
    title: typeof payload.title === "string" ? payload.title.trim() : "",
    description:
      typeof payload.description === "string" ? payload.description.trim() : "",
    isApproved: Boolean(payload.isApproved),
    order:
      typeof payload.order === "number" && Number.isFinite(payload.order)
        ? payload.order
        : 0,
  };
}

function toCharacterIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string"))]
    : [];
}

async function assignCharacters(lineageId: string, characterIds: string[]) {
  const characters = await readCharacters();
  const selectedIds = new Set(characterIds);

  await writeCharacters(
    characters.map((character) => ({
      ...character,
      lineageId: selectedIds.has(character.id)
        ? lineageId
        : character.lineageId === lineageId
          ? undefined
          : character.lineageId,
    })),
  );
}

export async function GET(request: Request) {
  const authError = await requireAdminRequest(request);
  if (authError) return authError;

  const [lineages, characters] = await Promise.all([
    readLineages(),
    readCharacters(),
  ]);

  return Response.json({
    lineages: lineages.map((lineage) => ({
      ...lineage,
      characterIds: characters
        .filter((character) => character.lineageId === lineage.id)
        .map((character) => character.id),
    })),
  });
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const payload = await request.json();
    const input = toLineageInput(payload);
    const characterIds = toCharacterIds(payload.characterIds);
    const lineages = await readLineages();

    if (!input.title) {
      return Response.json(
        { message: "عنوان تبارنامه الزامی است." },
        { status: 400 },
      );
    }

    if (lineages.some((lineage) => lineage.title === input.title)) {
      return Response.json(
        { message: "تبارنامه‌ای با این عنوان قبلا ثبت شده است." },
        { status: 400 },
      );
    }

    const lineage = await createLineage(input);
    await assignCharacters(lineage.id, characterIds);

    return Response.json({ lineage }, { status: 201 });
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
