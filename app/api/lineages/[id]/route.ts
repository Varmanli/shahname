import { requireAdminRequest } from "@/lib/admin-auth";
import { readCharacters, writeCharacters } from "@/lib/character-store";
import {
  deleteLineage,
  readLineages,
  updateLineage,
} from "@/lib/lineage-store";
import type { LineageInput } from "@/types/lineage";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const [lineages, characters] = await Promise.all([
    readLineages(),
    readCharacters(),
  ]);
  const lineage = lineages.find((item) => item.id === id);

  if (!lineage) {
    return Response.json({ message: "تبارنامه پیدا نشد." }, { status: 404 });
  }

  return Response.json({
    lineage: {
      ...lineage,
      characterIds: characters
        .filter((character) => character.lineageId === lineage.id)
        .map((character) => character.id),
    },
  });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const { id } = await context.params;
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

    if (
      lineages.some((lineage) => lineage.id !== id && lineage.title === input.title)
    ) {
      return Response.json(
        { message: "تبارنامه‌ای با این عنوان قبلا ثبت شده است." },
        { status: 400 },
      );
    }

    const lineage = await updateLineage(id, input);

    if (!lineage) {
      return Response.json({ message: "تبارنامه پیدا نشد." }, { status: 404 });
    }

    await assignCharacters(id, characterIds);

    return Response.json({ lineage });
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
    const deleted = await deleteLineage(id);

    if (!deleted) {
      return Response.json({ message: "تبارنامه پیدا نشد." }, { status: 404 });
    }

    const characters = await readCharacters();
    await writeCharacters(
      characters.map((character) => ({
        ...character,
        lineageId: character.lineageId === id ? undefined : character.lineageId,
      })),
    );

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
