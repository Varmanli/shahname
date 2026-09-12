import { randomUUID } from "node:crypto";

import { revalidateTag, unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";

import { normalizeInputRelations } from "@/lib/character-relations";
import { normalizeCharacterTraits } from "@/lib/traits";
import { normalizeHtmlAssetUrls, normalizeStoredAssetUrl } from "@/lib/uploads";
import { db } from "@/lib/server/db";
import { characterRelations, characters } from "@/lib/server/db/schema";
import type {
  Character,
  CharacterInput,
  CharacterRelation,
  CharacterVisualRole,
} from "@/types/character";

const CHARACTERS_CACHE_TAG = "characters";

export function createCharacterSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeVisualRole(value: unknown): CharacterVisualRole | undefined {
  return [
    "king",
    "queen",
    "hero",
    "sage",
    "royal-family",
    "notable",
  ].includes(value as string)
    ? (value as CharacterVisualRole)
    : undefined;
}

function toCharacter(
  row: typeof characters.$inferSelect,
  relations: CharacterRelation[],
): Character {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    title: row.title,
    epithets: row.epithets,
    role: row.role,
    visualRole: normalizeVisualRole(row.visualRole),
    nationality: row.nationality,
    nameMeaning: row.nameMeaning,
    father: row.father ?? undefined,
    mother: row.mother ?? undefined,
    fatherId: row.fatherId ?? undefined,
    motherId: row.motherId ?? undefined,
    spouseIds: row.spouseIds,
    childrenIds: row.childrenIds,
    siblingIds: row.siblingIds,
    relations,
    dynasty: row.dynasty,
    lineageGroup: row.lineageGroup,
    lineageId: row.lineageId ?? undefined,
    enemies: row.enemies,
    shortDescription: normalizeHtmlAssetUrls(row.shortDescription),
    fullDescription: normalizeHtmlAssetUrls(row.fullDescription),
    traits: normalizeCharacterTraits(row.traits),
    achievements: row.achievements,
    quote: normalizeHtmlAssetUrls(row.quote),
    portraitImage: normalizeStoredAssetUrl(row.portraitImage || row.avatarUrl) ?? "",
    sceneImage: normalizeStoredAssetUrl(row.sceneImage) ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toCharacterRow(
  input: CharacterInput,
  id: string,
  dates?: Partial<Pick<Character, "createdAt" | "updatedAt">>,
) {
  return {
    id,
    slug: input.slug,
    name: input.name,
    title: input.title,
    epithets: input.epithets,
    role: input.role,
    visualRole: normalizeVisualRole(input.visualRole),
    nationality: input.nationality,
    nameMeaning: input.nameMeaning,
    father: input.father,
    mother: input.mother,
    fatherId: input.fatherId,
    motherId: input.motherId,
    spouseIds: input.spouseIds,
    childrenIds: input.childrenIds,
    siblingIds: input.siblingIds,
    dynasty: input.dynasty,
    lineageGroup: input.lineageGroup,
    lineageId: input.lineageId,
    enemies: input.enemies,
    shortDescription: normalizeHtmlAssetUrls(input.shortDescription),
    fullDescription: normalizeHtmlAssetUrls(input.fullDescription),
    traits: input.traits,
    achievements: input.achievements,
    quote: normalizeHtmlAssetUrls(input.quote),
    avatarUrl: normalizeStoredAssetUrl(input.portraitImage) ?? "",
    portraitImage: normalizeStoredAssetUrl(input.portraitImage) ?? "",
    sceneImage: normalizeStoredAssetUrl(input.sceneImage) ?? "",
    ...(dates ?? {}),
  };
}

async function replaceCharacterRelations(characterId: string, relations: CharacterRelation[]) {
  await db
    .delete(characterRelations)
    .where(eq(characterRelations.sourceCharacterId, characterId));

  const validRelations = relations.filter(
    (relation) =>
      relation.sourceCharacterId &&
      relation.targetCharacterId &&
      relation.sourceCharacterId !== relation.targetCharacterId,
  );

  if (!validRelations.length) return;

  await db.insert(characterRelations).values(
    validRelations.map((relation) => ({
      id: relation.id || randomUUID(),
      sourceCharacterId: relation.sourceCharacterId,
      targetCharacterId: relation.targetCharacterId,
      type: relation.type,
      note: relation.note,
      order: relation.order ?? 0,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt,
    })),
  );
}

async function readCharactersUncached(): Promise<Character[]> {
  const [rows, relationRows] = await Promise.all([
    db.select().from(characters).orderBy(asc(characters.createdAt)),
    db
      .select()
      .from(characterRelations)
      .orderBy(asc(characterRelations.sourceCharacterId), asc(characterRelations.order)),
  ]);

  const relationsByCharacter = new Map<string, CharacterRelation[]>();

  for (const relation of relationRows) {
    const current = relationsByCharacter.get(relation.sourceCharacterId) ?? [];
    current.push({
      id: relation.id,
      sourceCharacterId: relation.sourceCharacterId,
      targetCharacterId: relation.targetCharacterId,
      type: relation.type,
      note: relation.note ?? undefined,
      order: relation.order,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt,
    });
    relationsByCharacter.set(relation.sourceCharacterId, current);
  }

  return rows.map((row) =>
    toCharacter(row, relationsByCharacter.get(row.id) ?? []),
  );
}

const readCachedCharacters = unstable_cache(
  readCharactersUncached,
  [CHARACTERS_CACHE_TAG],
  { revalidate: 60, tags: [CHARACTERS_CACHE_TAG] },
);

export function readCharacters(): Promise<Character[]> {
  return readCachedCharacters();
}

export async function writeCharacters(nextCharacters: Character[]) {
  await db.transaction(async (tx) => {
    for (const character of nextCharacters) {
      await tx
        .insert(characters)
        .values(toCharacterRow(character, character.id, {
          createdAt: character.createdAt,
          updatedAt: character.updatedAt,
        }))
        .onConflictDoUpdate({
          target: characters.id,
          set: toCharacterRow(character, character.id, {
            updatedAt: character.updatedAt,
          }),
        });
    }
  });

  for (const character of nextCharacters) {
    await replaceCharacterRelations(character.id, character.relations);
  }

  revalidateTag(CHARACTERS_CACHE_TAG, "max");
}

export async function createCharacter(input: CharacterInput) {
  const now = new Date().toISOString();
  const id = randomUUID();
  const normalized = normalizeInputRelations(input, id);
  const [character] = await db
    .insert(characters)
    .values(toCharacterRow(normalized, id, { createdAt: now, updatedAt: now }))
    .returning();

  await replaceCharacterRelations(id, normalized.relations);
  revalidateTag(CHARACTERS_CACHE_TAG, "max");
  return toCharacter(character, normalized.relations);
}

export async function updateCharacter(id: string, input: CharacterInput) {
  const normalized = normalizeInputRelations(input, id);
  const [character] = await db
    .update(characters)
    .set(toCharacterRow(normalized, id, { updatedAt: new Date().toISOString() }))
    .where(eq(characters.id, id))
    .returning();

  if (!character) return null;

  await replaceCharacterRelations(id, normalized.relations);
  revalidateTag(CHARACTERS_CACHE_TAG, "max");
  return toCharacter(character, normalized.relations);
}

export async function deleteCharacter(id: string) {
  const deleted = await db.delete(characters).where(eq(characters.id, id)).returning();

  if (!deleted.length) return false;

  revalidateTag(CHARACTERS_CACHE_TAG, "max");
  const allCharacters = await readCharacters();
  await Promise.all(
    allCharacters.map((character) => {
      const input: CharacterInput = {
        ...character,
        fatherId: character.fatherId === id ? undefined : character.fatherId,
        motherId: character.motherId === id ? undefined : character.motherId,
        spouseIds: character.spouseIds.filter((item) => item !== id),
        childrenIds: character.childrenIds.filter((item) => item !== id),
        siblingIds: character.siblingIds.filter((item) => item !== id),
        relations: character.relations.filter(
          (relation) =>
            relation.sourceCharacterId !== id && relation.targetCharacterId !== id,
        ),
      };

      return updateCharacter(character.id, input);
    }),
  );

  revalidateTag(CHARACTERS_CACHE_TAG, "max");
  return true;
}
