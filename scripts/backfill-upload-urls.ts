import "dotenv/config";

import { eq } from "drizzle-orm";

import { normalizeHtmlAssetUrls, normalizeStoredAssetUrl } from "@/lib/uploads";
import { db } from "@/lib/server/db";
import {
  characters,
  homeHeroSlides,
  media,
  siteSettings,
  stories,
  storyScenes,
  storySections,
} from "@/lib/server/db/schema";

function normalizeJsonAssetUrls(value: unknown): unknown {
  if (typeof value === "string") {
    const normalizedHtml = normalizeHtmlAssetUrls(value);
    if (normalizedHtml !== value) return normalizedHtml;

    return normalizeStoredAssetUrl(value) ?? value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonAssetUrls(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeJsonAssetUrls(item)]),
    );
  }

  return value;
}

async function backfillCharacters() {
  const rows = await db.select().from(characters);
  let updated = 0;

  for (const row of rows) {
    const nextValues = {
      avatarUrl: normalizeStoredAssetUrl(row.avatarUrl) ?? row.avatarUrl,
      portraitImage:
        normalizeStoredAssetUrl(row.portraitImage) ?? row.portraitImage,
      sceneImage: normalizeStoredAssetUrl(row.sceneImage) ?? row.sceneImage,
      shortDescription: normalizeHtmlAssetUrls(row.shortDescription),
      fullDescription: normalizeHtmlAssetUrls(row.fullDescription),
      quote: normalizeHtmlAssetUrls(row.quote),
    };

    const changed = Object.entries(nextValues).some(
      ([key, value]) => value !== row[key as keyof typeof nextValues],
    );

    if (!changed) continue;

    await db.update(characters).set(nextValues).where(eq(characters.id, row.id));
    updated += 1;
  }

  return updated;
}

async function backfillStories() {
  const rows = await db.select().from(stories);
  let updated = 0;

  for (const row of rows) {
    const nextValues = {
      coverImage: normalizeStoredAssetUrl(row.coverImage) ?? row.coverImage,
      content: normalizeHtmlAssetUrls(row.content),
      quote: normalizeHtmlAssetUrls(row.quote),
    };

    const changed = Object.entries(nextValues).some(
      ([key, value]) => value !== row[key as keyof typeof nextValues],
    );

    if (!changed) continue;

    await db.update(stories).set(nextValues).where(eq(stories.id, row.id));
    updated += 1;
  }

  return updated;
}

async function backfillStorySections() {
  const rows = await db.select().from(storySections);
  let updated = 0;

  for (const row of rows) {
    const nextValues = {
      content: normalizeHtmlAssetUrls(row.content),
      image: normalizeStoredAssetUrl(row.image) ?? row.image,
    };

    const changed = Object.entries(nextValues).some(
      ([key, value]) => value !== row[key as keyof typeof nextValues],
    );

    if (!changed) continue;

    await db.update(storySections).set(nextValues).where(eq(storySections.id, row.id));
    updated += 1;
  }

  return updated;
}

async function backfillStoryScenes() {
  const rows = await db.select().from(storyScenes);
  let updated = 0;

  for (const row of rows) {
    const image = normalizeStoredAssetUrl(row.image) ?? row.image;
    if (image === row.image) continue;

    await db.update(storyScenes).set({ image }).where(eq(storyScenes.id, row.id));
    updated += 1;
  }

  return updated;
}

async function backfillHeroSlides() {
  const rows = await db.select().from(homeHeroSlides);
  let updated = 0;

  for (const row of rows) {
    const image = normalizeStoredAssetUrl(row.image) ?? row.image;
    if (image === row.image) continue;

    await db
      .update(homeHeroSlides)
      .set({ image })
      .where(eq(homeHeroSlides.id, row.id));
    updated += 1;
  }

  return updated;
}

async function backfillMedia() {
  const rows = await db.select().from(media);
  let updated = 0;

  for (const row of rows) {
    const url = normalizeStoredAssetUrl(row.url) ?? row.url;
    if (url === row.url) continue;

    await db.update(media).set({ url }).where(eq(media.id, row.id));
    updated += 1;
  }

  return updated;
}

async function backfillSiteSettings() {
  const rows = await db.select().from(siteSettings);
  let updated = 0;

  for (const row of rows) {
    const value = normalizeJsonAssetUrls(row.value);
    if (JSON.stringify(value) === JSON.stringify(row.value)) continue;

    await db
      .update(siteSettings)
      .set({ value, updatedAt: new Date().toISOString() })
      .where(eq(siteSettings.key, row.key));
    updated += 1;
  }

  return updated;
}

async function main() {
  const counts = {
    characters: await backfillCharacters(),
    stories: await backfillStories(),
    storySections: await backfillStorySections(),
    storyScenes: await backfillStoryScenes(),
    homeHeroSlides: await backfillHeroSlides(),
    media: await backfillMedia(),
    siteSettings: await backfillSiteSettings(),
  };

  console.log("Backfill complete.");
  console.table(counts);
}

main().catch((error) => {
  console.error("Upload URL backfill failed.", error);
  process.exitCode = 1;
});
