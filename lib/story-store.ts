import { randomUUID } from "node:crypto";

import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/server/db";
import {
  stories,
  storyCharacters,
  storyScenes,
  storySections,
} from "@/lib/server/db/schema";
import { calculateStoryReadingTime } from "@/lib/reading-time";
import type { Story, StoryInput } from "@/types/story";

export function createStorySlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function readStoryChildren(storyId: string) {
  const [sections, characters, scenes] = await Promise.all([
    db
      .select()
      .from(storySections)
      .where(eq(storySections.storyId, storyId))
      .orderBy(asc(storySections.order)),
    db
      .select()
      .from(storyCharacters)
      .where(eq(storyCharacters.storyId, storyId))
      .orderBy(asc(storyCharacters.order)),
    db
      .select()
      .from(storyScenes)
      .where(eq(storyScenes.storyId, storyId))
      .orderBy(asc(storyScenes.order)),
  ]);

  return {
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: section.content,
      ...(section.image ? { image: section.image } : {}),
    })),
    characters: characters.map((character) => ({
      name: character.name,
      slug: character.slug,
    })),
    scenes: scenes.map((scene) => ({
      id: scene.id,
      image: scene.image,
      ...(scene.title ? { title: scene.title } : {}),
    })),
  };
}

async function toStory(row: typeof stories.$inferSelect): Promise<Story> {
  const children = await readStoryChildren(row.id);

  const story = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    shortDescription: row.shortDescription || row.summary,
    content: row.content,
    sections: children.sections,
    characters: children.characters,
    coverImage: row.coverImage,
    scenes: children.scenes,
    quote: row.quote,
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
        content: section.content,
        image: section.image,
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
        image: scene.image,
        title: scene.title,
        order: index,
      })),
    );
  }
}

export async function readStories(): Promise<Story[]> {
  const rows = await db
    .select()
    .from(stories)
    .orderBy(asc(stories.order), asc(stories.title));

  return Promise.all(rows.map(toStory));
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
        content: story.content,
        coverImage: story.coverImage,
        quote: story.quote,
        order: story.order,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      });
    }
  });

  for (const story of nextStories) {
    await replaceStoryChildren(story.id, story);
  }
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
      content: input.content,
      coverImage: input.coverImage,
      quote: input.quote,
      order: input.order,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await replaceStoryChildren(id, input);
  return toStory(story);
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
      content: input.content,
      coverImage: input.coverImage,
      quote: input.quote,
      order: input.order,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(stories.id, id))
    .returning();

  if (!story) return null;

  await replaceStoryChildren(id, input);
  return toStory(story);
}

export async function deleteStory(id: string) {
  const deleted = await db.delete(stories).where(eq(stories.id, id)).returning();
  return deleted.length > 0;
}
