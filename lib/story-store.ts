import { randomUUID } from "node:crypto";

import { revalidateTag, unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/server/db";
import { normalizeHtmlAssetUrls, normalizeStoredAssetUrl } from "@/lib/uploads";
import {
  stories,
  storyCharacters,
  storyScenes,
  storySections,
} from "@/lib/server/db/schema";
import { calculateStoryReadingTime } from "@/lib/reading-time";
import type { Story, StoryInput } from "@/types/story";

const STORIES_CACHE_TAG = "stories";

export function createStorySlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type StoryChildren = Pick<Story, "characters" | "scenes" | "sections">;

function normalizeStoryChildren(
  sections: Array<typeof storySections.$inferSelect>,
  characters: Array<typeof storyCharacters.$inferSelect>,
  scenes: Array<typeof storyScenes.$inferSelect>,
): StoryChildren {
  return {
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: normalizeHtmlAssetUrls(section.content),
      ...(section.image
        ? { image: normalizeStoredAssetUrl(section.image) ?? undefined }
        : {}),
    })),
    characters: characters.map((character) => ({
      name: character.name,
      slug: character.slug,
    })),
    scenes: scenes.map((scene) => ({
      id: scene.id,
      image: normalizeStoredAssetUrl(scene.image) ?? scene.image,
      ...(scene.title ? { title: scene.title } : {}),
    })),
  };
}

function normalizeStoryInputChildren(input: StoryInput): StoryChildren {
  return {
    sections: input.sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: normalizeHtmlAssetUrls(section.content),
      ...(section.image
        ? { image: normalizeStoredAssetUrl(section.image) ?? undefined }
        : {}),
    })),
    characters: input.characters.map((character) => ({
      name: character.name,
      slug: character.slug,
    })),
    scenes: input.scenes.map((scene) => ({
      id: scene.id,
      image: normalizeStoredAssetUrl(scene.image) ?? scene.image,
      ...(scene.title ? { title: scene.title } : {}),
    })),
  };
}

function toStory(
  row: typeof stories.$inferSelect,
  children: StoryChildren,
): Story {
  const story = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    shortDescription: row.shortDescription || row.summary,
    content: normalizeHtmlAssetUrls(row.content),
    sections: children.sections,
    characters: children.characters,
    coverImage: normalizeStoredAssetUrl(row.coverImage) ?? "",
    scenes: children.scenes,
    quote: normalizeHtmlAssetUrls(row.quote),
    order: row.order,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  return {
    ...story,
    readingTimeMinutes: calculateStoryReadingTime(story),
  };
}

async function replaceStoryChildren(storyId: string, input: StoryInput) {
  await db.delete(storySections).where(eq(storySections.storyId, storyId));
  await db.delete(storyCharacters).where(eq(storyCharacters.storyId, storyId));
  await db.delete(storyScenes).where(eq(storyScenes.storyId, storyId));

  if (input.sections.length) {
    await db.insert(storySections).values(
      input.sections.map((section, index) => ({
        id: section.id || randomUUID(),
        storyId,
        title: section.title,
        content: normalizeHtmlAssetUrls(section.content),
        image: normalizeStoredAssetUrl(section.image),
        order: index,
      })),
    );
  }

  if (input.characters.length) {
    await db.insert(storyCharacters).values(
      input.characters.map((character, index) => ({
        id: `${storyId}:${character.slug}:${index}`,
        storyId,
        name: character.name,
        slug: character.slug,
        order: index,
      })),
    );
  }

  if (input.scenes.length) {
    await db.insert(storyScenes).values(
      input.scenes.map((scene, index) => ({
        id: scene.id || randomUUID(),
        storyId,
        image: normalizeStoredAssetUrl(scene.image) ?? scene.image,
        title: scene.title,
        order: index,
      })),
    );
  }
}

async function readStoriesUncached(): Promise<Story[]> {
  const [rows, sectionRows, characterRows, sceneRows] = await Promise.all([
    db
      .select()
      .from(stories)
      .orderBy(asc(stories.order), asc(stories.title)),
    db
      .select()
      .from(storySections)
      .orderBy(asc(storySections.storyId), asc(storySections.order)),
    db
      .select()
      .from(storyCharacters)
      .orderBy(asc(storyCharacters.storyId), asc(storyCharacters.order)),
    db
      .select()
      .from(storyScenes)
      .orderBy(asc(storyScenes.storyId), asc(storyScenes.order)),
  ]);

  const sectionsByStory = new Map<string, Array<typeof storySections.$inferSelect>>();
  const charactersByStory = new Map<string, Array<typeof storyCharacters.$inferSelect>>();
  const scenesByStory = new Map<string, Array<typeof storyScenes.$inferSelect>>();

  for (const section of sectionRows) {
    const current = sectionsByStory.get(section.storyId) ?? [];
    current.push(section);
    sectionsByStory.set(section.storyId, current);
  }

  for (const character of characterRows) {
    const current = charactersByStory.get(character.storyId) ?? [];
    current.push(character);
    charactersByStory.set(character.storyId, current);
  }

  for (const scene of sceneRows) {
    const current = scenesByStory.get(scene.storyId) ?? [];
    current.push(scene);
    scenesByStory.set(scene.storyId, current);
  }

  return rows.map((row) =>
    toStory(
      row,
      normalizeStoryChildren(
        sectionsByStory.get(row.id) ?? [],
        charactersByStory.get(row.id) ?? [],
        scenesByStory.get(row.id) ?? [],
      ),
    ),
  );
}

const readCachedStories = unstable_cache(
  readStoriesUncached,
  [STORIES_CACHE_TAG],
  { revalidate: 60, tags: [STORIES_CACHE_TAG] },
);

export function readStories(): Promise<Story[]> {
  return readCachedStories();
}

export async function writeStories(nextStories: Story[]) {
  await db.transaction(async (tx) => {
    await tx.delete(stories);
    for (const story of nextStories) {
      await tx.insert(stories).values({
        id: story.id,
        title: story.title,
        slug: story.slug,
        subtitle: story.subtitle,
        summary: story.shortDescription,
        shortDescription: story.shortDescription,
        content: normalizeHtmlAssetUrls(story.content),
        coverImage: normalizeStoredAssetUrl(story.coverImage) ?? "",
        quote: normalizeHtmlAssetUrls(story.quote),
        order: story.order,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      });
    }
  });

  for (const story of nextStories) {
    await replaceStoryChildren(story.id, story);
  }

  revalidateTag(STORIES_CACHE_TAG, "max");
}

export async function createStory(input: StoryInput) {
  const now = new Date().toISOString();
  const id = randomUUID();
  const [story] = await db
    .insert(stories)
    .values({
      id,
      title: input.title,
      slug: input.slug,
      subtitle: input.subtitle,
      summary: input.shortDescription,
      shortDescription: input.shortDescription,
      content: normalizeHtmlAssetUrls(input.content),
      coverImage: normalizeStoredAssetUrl(input.coverImage) ?? "",
      quote: normalizeHtmlAssetUrls(input.quote),
      order: input.order,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await replaceStoryChildren(id, input);
  revalidateTag(STORIES_CACHE_TAG, "max");
  return toStory(story, normalizeStoryInputChildren(input));
}

export async function updateStory(id: string, input: StoryInput) {
  const [story] = await db
    .update(stories)
    .set({
      title: input.title,
      slug: input.slug,
      subtitle: input.subtitle,
      summary: input.shortDescription,
      shortDescription: input.shortDescription,
      content: normalizeHtmlAssetUrls(input.content),
      coverImage: normalizeStoredAssetUrl(input.coverImage) ?? "",
      quote: normalizeHtmlAssetUrls(input.quote),
      order: input.order,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(stories.id, id))
    .returning();

  if (!story) return null;

  await replaceStoryChildren(id, input);
  revalidateTag(STORIES_CACHE_TAG, "max");
  return toStory(story, normalizeStoryInputChildren(input));
}

export async function deleteStory(id: string) {
  const deleted = await db.delete(stories).where(eq(stories.id, id)).returning();
  if (deleted.length) revalidateTag(STORIES_CACHE_TAG, "max");
  return deleted.length > 0;
}
