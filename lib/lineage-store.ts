import { randomUUID } from "node:crypto";

import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/server/db";
import { lineages } from "@/lib/server/db/schema";
import type { Lineage, LineageInput } from "@/types/lineage";

export async function readLineages() {
  return db.select().from(lineages).orderBy(asc(lineages.order), asc(lineages.title));
}

export async function writeLineages(nextLineages: Lineage[]) {
  await db.transaction(async (tx) => {
    await tx.delete(lineages);
    for (const lineage of nextLineages) {
      await tx.insert(lineages).values(lineage);
    }
  });
}

export async function createLineage(input: LineageInput) {
  const now = new Date().toISOString();
  const [lineage] = await db
    .insert(lineages)
    .values({
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return lineage;
}

export async function updateLineage(id: string, input: LineageInput) {
  const [lineage] = await db
    .update(lineages)
    .set({
      ...input,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(lineages.id, id))
    .returning();

  return lineage ?? null;
}

export async function deleteLineage(id: string) {
  const deleted = await db.delete(lineages).where(eq(lineages.id, id)).returning();
  return deleted.length > 0;
}
