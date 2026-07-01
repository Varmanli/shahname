import { requireAdminRequest } from "@/lib/admin-auth";
import { readCharacters } from "@/lib/character-store";
import {
  createRelationship,
  readRelationships,
} from "@/lib/relationship-store";
import type {
  RelationshipConfidence,
  RelationshipInput,
  RelationshipType,
} from "@/types/relationship";

export const dynamic = "force-dynamic";

const relationshipTypes = new Set<RelationshipType>([
  "parent_child",
  "spouse",
  "indirect_lineage",
  "ally",
  "other",
]);

const confidenceValues = new Set<RelationshipConfidence>([
  "confirmed",
  "inferred",
  "legendary",
]);

function toRelationshipInput(payload: Partial<RelationshipInput>) {
  const type = relationshipTypes.has(payload.type as RelationshipType)
    ? (payload.type as RelationshipType)
    : "other";
  const confidence = confidenceValues.has(
    payload.confidence as RelationshipConfidence,
  )
    ? (payload.confidence as RelationshipConfidence)
    : undefined;

  return {
    sourceCharacterId:
      typeof payload.sourceCharacterId === "string"
        ? payload.sourceCharacterId
        : "",
    targetCharacterId:
      typeof payload.targetCharacterId === "string"
        ? payload.targetCharacterId
        : "",
    type,
    label: typeof payload.label === "string" ? payload.label.trim() : undefined,
    description:
      typeof payload.description === "string"
        ? payload.description.trim()
        : undefined,
    confidence,
    order:
      typeof payload.order === "number" && Number.isFinite(payload.order)
        ? payload.order
        : 0,
  };
}

async function validateRelationship(input: RelationshipInput) {
  if (!input.sourceCharacterId || !input.targetCharacterId) {
    return "انتخاب مبدا و مقصد رابطه الزامی است.";
  }

  if (input.sourceCharacterId === input.targetCharacterId) {
    return "مبدا و مقصد رابطه نمی‌توانند یک شخصیت باشند.";
  }

  const characters = await readCharacters();
  const characterIds = new Set(characters.map((character) => character.id));
  if (
    !characterIds.has(input.sourceCharacterId) ||
    !characterIds.has(input.targetCharacterId)
  ) {
    return "یکی از شخصیت‌های انتخاب‌شده وجود ندارد.";
  }

  return null;
}

export async function GET(request: Request) {
  const authError = await requireAdminRequest(request);
  if (authError) return authError;

  const relationships = await readRelationships();
  return Response.json({ relationships });
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const input = toRelationshipInput(await request.json());
    const error = await validateRelationship(input);
    if (error) {
      return Response.json({ message: error }, { status: 400 });
    }

    const relationship = await createRelationship(input);
    return Response.json({ relationship }, { status: 201 });
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
