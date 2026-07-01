import { randomUUID } from "node:crypto";

import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/server/db";
import { relationships } from "@/lib/server/db/schema";
import type { Relationship, RelationshipInput } from "@/types/relationship";

function toRelationship(row: typeof relationships.$inferSelect): Relationship {
  return {
    id: row.id,
    sourceCharacterId: row.sourceCharacterId,
    targetCharacterId: row.targetCharacterId,
    type: row.type,
    label: row.label ?? undefined,
    description: row.description ?? undefined,
    confidence: row.confidence ?? undefined,
    order: row.order,
  };
}

export async function readRelationships(): Promise<Relationship[]> {
  const rows = await db
    .select()
    .from(relationships)
    .orderBy(asc(relationships.order));

  return rows.map(toRelationship);
}

export async function writeRelationships(nextRelationships: Relationship[]) {
  await db.transaction(async (tx) => {
    await tx.delete(relationships);
    if (nextRelationships.length) {
      await tx.insert(relationships).values(nextRelationships);
    }
  });
}

export async function createRelationship(input: RelationshipInput) {
  const [relationship] = await db
    .insert(relationships)
    .values({
      ...input,
      id: randomUUID(),
      order: input.order ?? 0,
    })
    .returning();

  return toRelationship(relationship);
}

export async function updateRelationship(id: string, input: RelationshipInput) {
  const [relationship] = await db
    .update(relationships)
    .set({
      ...input,
      order: input.order ?? 0,
    })
    .where(eq(relationships.id, id))
    .returning();

  if (!relationship) return null;

  return toRelationship(relationship);
}

export async function deleteRelationship(id: string) {
  const deleted = await db
    .delete(relationships)
    .where(eq(relationships.id, id))
    .returning();

  return deleted.length > 0;
}
