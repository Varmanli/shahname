import { randomUUID } from "node:crypto";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/server/db";
import { homeHeroSlides } from "@/lib/server/db/schema";
import { normalizeStoredAssetUrl } from "@/lib/uploads";
import type { HomeHeroSlide, HomeHeroSlideInput } from "@/types/home-hero-slide";

function normalizeSlide(row: typeof homeHeroSlides.$inferSelect): HomeHeroSlide {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image: normalizeStoredAssetUrl(row.image) ?? "",
    primaryButtonLabel: row.primaryButtonLabel,
    primaryButtonHref: row.primaryButtonHref,
    secondaryButtonLabel: row.secondaryButtonLabel,
    secondaryButtonHref: row.secondaryButtonHref,
    contentPosition: row.contentPosition,
    order: row.order,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function readHomeHeroSlides() {
  const rows = await db
    .select()
    .from(homeHeroSlides)
    .orderBy(asc(homeHeroSlides.order), asc(homeHeroSlides.createdAt));

  return rows.map(normalizeSlide);
}

export async function readActiveHomeHeroSlides() {
  const rows = await db
    .select()
    .from(homeHeroSlides)
    .where(eq(homeHeroSlides.isActive, true))
    .orderBy(asc(homeHeroSlides.order), asc(homeHeroSlides.createdAt));

  return rows.map(normalizeSlide);
}

export async function createHomeHeroSlide(input: HomeHeroSlideInput) {
  const now = new Date().toISOString();
  const [slide] = await db
    .insert(homeHeroSlides)
    .values({
      ...input,
      image: normalizeStoredAssetUrl(input.image) ?? "",
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return normalizeSlide(slide);
}

export async function updateHomeHeroSlide(id: string, input: HomeHeroSlideInput) {
  const [slide] = await db
    .update(homeHeroSlides)
    .set({
      ...input,
      image: normalizeStoredAssetUrl(input.image) ?? "",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(homeHeroSlides.id, id))
    .returning();

  return slide ? normalizeSlide(slide) : null;
}

export async function deleteHomeHeroSlide(id: string) {
  const deleted = await db
    .delete(homeHeroSlides)
    .where(eq(homeHeroSlides.id, id))
    .returning();

  return deleted.length > 0;
}

export async function reorderHomeHeroSlides(
  items: Array<{ id: string; order: number }>,
) {
  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .update(homeHeroSlides)
        .set({
          order: item.order,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(homeHeroSlides.id, item.id));
    }
  });

  return readHomeHeroSlides();
}

export async function setHomeHeroSlideActiveState(id: string, isActive: boolean) {
  const [slide] = await db
    .update(homeHeroSlides)
    .set({
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(homeHeroSlides.id, id))
    .returning();

  return slide ? normalizeSlide(slide) : null;
}

export async function readHomeHeroSlideById(id: string) {
  const [slide] = await db
    .select()
    .from(homeHeroSlides)
    .where(and(eq(homeHeroSlides.id, id)));

  return slide ? normalizeSlide(slide) : null;
}
