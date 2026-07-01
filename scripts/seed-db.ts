import "dotenv/config";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/server/db/schema";
import { normalizeInputRelations } from "@/lib/character-relations";
import { normalizeCharacterTraits } from "@/lib/traits";
import type { Character, CharacterInput, CharacterRelation } from "@/types/character";
import type { ContactMessage } from "@/types/contact-message";
import type { Lineage } from "@/types/lineage";
import type { Relationship } from "@/types/relationship";
import type { SiteSettings } from "@/types/site-settings";
import type { Story } from "@/types/story";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const sql = postgres(databaseUrl, { max: 1, prepare: false });
const db = drizzle(sql, { schema });
const dataDir = path.join(process.cwd(), "data");
const fallbackDate = new Date(0).toISOString();

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(dataDir, fileName), "utf8");
    return raw.trim() ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function toDate(value: unknown) {
  return typeof value === "string" && value ? value : fallbackDate;
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function storySlug(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeStory(story: Partial<Story>): Story {
  const id = story.id || randomUUID();
  const title = story.title ?? "";

  return {
    id,
    title,
    slug: story.slug || storySlug(title) || id,
    subtitle: story.subtitle ?? "",
    shortDescription: story.shortDescription ?? "",
    content: story.content ?? "",
    sections: Array.isArray(story.sections) ? story.sections : [],
    characters: Array.isArray(story.characters) ? story.characters : [],
    coverImage: story.coverImage ?? "",
    scenes: Array.isArray(story.scenes) ? story.scenes : [],
    quote: story.quote ?? "",
    order: Number.isFinite(story.order) ? Number(story.order) : 0,
    createdAt: toDate(story.createdAt),
    updatedAt: toDate(story.updatedAt),
  };
}

function characterSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeCharacter(character: Partial<Character>): Character {
  const id = character.id || randomUUID();
  const name = character.name ?? "";
  const input: CharacterInput = {
    name,
    slug: character.slug || characterSlug(name) || id,
    title: character.title ?? "",
    epithets: toStringArray(character.epithets),
    role: character.role ?? "",
    visualRole: normalizeVisualRole(character.visualRole),
    nationality: character.nationality ?? "",
    nameMeaning: character.nameMeaning ?? "",
    father: character.father || undefined,
    mother: character.mother || undefined,
    fatherId: character.fatherId || undefined,
    motherId: character.motherId || undefined,
    spouseIds: toStringArray(character.spouseIds),
    childrenIds: toStringArray(character.childrenIds),
    siblingIds: toStringArray(character.siblingIds),
    relations: Array.isArray(character.relations)
      ? (character.relations as CharacterRelation[])
      : [],
    dynasty: character.dynasty ?? "",
    lineageGroup: character.lineageGroup ?? character.dynasty ?? "",
    lineageId: character.lineageId || undefined,
    enemies: toStringArray(character.enemies),
    shortDescription: character.shortDescription ?? "",
    fullDescription: character.fullDescription ?? "",
    traits: normalizeCharacterTraits(character.traits),
    achievements: toStringArray(character.achievements),
    quote: character.quote ?? "",
    portraitImage: character.portraitImage ?? "",
    sceneImage: character.sceneImage ?? "",
  };

  return {
    ...normalizeInputRelations(input, id),
    id,
    createdAt: toDate(character.createdAt),
    updatedAt: toDate(character.updatedAt),
  };
}

function normalizeVisualRole(value: unknown): Character["visualRole"] {
  return [
    "king",
    "queen",
    "hero",
    "sage",
    "royal-family",
    "notable",
  ].includes(value as string)
    ? (value as Character["visualRole"])
    : undefined;
}

async function upsertMedia(id: string, url: string, alt?: string) {
  if (!url) return;

  await db
    .insert(schema.media)
    .values({
      id,
      key: url,
      url,
      alt,
    })
    .onConflictDoUpdate({
      target: schema.media.key,
      set: {
        url,
        alt,
      },
    });
}

async function seed() {
  const stories = (await readJson<Array<Partial<Story>>>("stories.json", [])).map(
    normalizeStory,
  );
  const characters = (
    await readJson<Array<Partial<Character>>>("characters.json", [])
  ).map(normalizeCharacter);
  const lineages = await readJson<Lineage[]>("lineages.json", []);
  const relationships = await readJson<Relationship[]>("relationships.json", []);
  const messages = await readJson<ContactMessage[]>("contact-messages.json", []);
  const settings = await readJson<SiteSettings>("site-settings.json", {
    homeCharacterIds: [],
    homeStoryIds: [],
  });

  await db.transaction(async (tx) => {
    for (const lineage of lineages) {
      await tx
        .insert(schema.lineages)
        .values({
          ...lineage,
          createdAt: toDate(lineage.createdAt),
          updatedAt: toDate(lineage.updatedAt),
        })
        .onConflictDoUpdate({
          target: schema.lineages.id,
          set: {
            title: lineage.title,
            description: lineage.description,
            isApproved: lineage.isApproved,
            order: lineage.order,
            updatedAt: toDate(lineage.updatedAt),
          },
        });
    }

    for (const character of characters) {
      await tx
        .insert(schema.characters)
        .values({
          id: character.id,
          slug: character.slug,
          name: character.name,
          title: character.title,
          epithets: character.epithets,
          role: character.role,
          visualRole: character.visualRole,
          nationality: character.nationality,
          nameMeaning: character.nameMeaning,
          father: character.father,
          mother: character.mother,
          fatherId: character.fatherId,
          motherId: character.motherId,
          spouseIds: character.spouseIds,
          childrenIds: character.childrenIds,
          siblingIds: character.siblingIds,
          dynasty: character.dynasty,
          lineageGroup: character.lineageGroup,
          lineageId: character.lineageId,
          enemies: character.enemies,
          shortDescription: character.shortDescription,
          fullDescription: character.fullDescription,
          traits: character.traits,
          achievements: character.achievements,
          quote: character.quote,
          avatarUrl: character.portraitImage,
          portraitImage: character.portraitImage,
          sceneImage: character.sceneImage,
          createdAt: character.createdAt,
          updatedAt: character.updatedAt,
        })
        .onConflictDoUpdate({
          target: schema.characters.id,
          set: {
            slug: character.slug,
            name: character.name,
            title: character.title,
            epithets: character.epithets,
            role: character.role,
            visualRole: character.visualRole,
            nationality: character.nationality,
            nameMeaning: character.nameMeaning,
            father: character.father,
            mother: character.mother,
            fatherId: character.fatherId,
            motherId: character.motherId,
            spouseIds: character.spouseIds,
            childrenIds: character.childrenIds,
            siblingIds: character.siblingIds,
            dynasty: character.dynasty,
            lineageGroup: character.lineageGroup,
            lineageId: character.lineageId,
            enemies: character.enemies,
            shortDescription: character.shortDescription,
            fullDescription: character.fullDescription,
            traits: character.traits,
            achievements: character.achievements,
            quote: character.quote,
            avatarUrl: character.portraitImage,
            portraitImage: character.portraitImage,
            sceneImage: character.sceneImage,
            updatedAt: character.updatedAt,
          },
        });
    }

    await tx.delete(schema.characterRelations);
    for (const character of characters) {
      for (const relation of character.relations) {
        await tx
          .insert(schema.characterRelations)
          .values({
            id: relation.id,
            sourceCharacterId: relation.sourceCharacterId,
            targetCharacterId: relation.targetCharacterId,
            type: relation.type,
            note: relation.note,
            order: relation.order ?? 0,
            createdAt: toDate(relation.createdAt),
            updatedAt: toDate(relation.updatedAt),
          })
          .onConflictDoNothing();
      }
    }

    for (const story of stories) {
      await tx
        .insert(schema.stories)
        .values({
          id: story.id,
          slug: story.slug,
          title: story.title,
          subtitle: story.subtitle,
          summary: story.shortDescription,
          shortDescription: story.shortDescription,
          content: story.content,
          coverImage: story.coverImage,
          quote: story.quote,
          order: story.order,
          createdAt: story.createdAt,
          updatedAt: story.updatedAt,
        })
        .onConflictDoUpdate({
          target: schema.stories.id,
          set: {
            slug: story.slug,
            title: story.title,
            subtitle: story.subtitle,
            summary: story.shortDescription,
            shortDescription: story.shortDescription,
            content: story.content,
            coverImage: story.coverImage,
            quote: story.quote,
            order: story.order,
            updatedAt: story.updatedAt,
          },
        });

      await tx.delete(schema.storySections).where(eq(schema.storySections.storyId, story.id));
      await tx.delete(schema.storyCharacters).where(eq(schema.storyCharacters.storyId, story.id));
      await tx.delete(schema.storyScenes).where(eq(schema.storyScenes.storyId, story.id));

      for (const [index, section] of story.sections.entries()) {
        await tx.insert(schema.storySections).values({
          id: section.id || randomUUID(),
          storyId: story.id,
          title: section.title,
          content: section.content,
          image: section.image,
          order: index,
          createdAt: story.createdAt,
          updatedAt: story.updatedAt,
        });
      }

      for (const [index, character] of story.characters.entries()) {
        const matched = characters.find((item) => item.slug === character.slug);
        await tx.insert(schema.storyCharacters).values({
          id: `${story.id}:${character.slug}:${index}`,
          storyId: story.id,
          characterId: matched?.id,
          name: character.name,
          slug: character.slug,
          order: index,
        });
      }

      for (const [index, scene] of story.scenes.entries()) {
        await tx.insert(schema.storyScenes).values({
          id: scene.id || randomUUID(),
          storyId: story.id,
          image: scene.image,
          title: scene.title,
          order: index,
        });
      }
    }

    await tx.delete(schema.relationships);
    for (const relationship of relationships) {
      await tx
        .insert(schema.relationships)
        .values({
          id: relationship.id,
          sourceCharacterId: relationship.sourceCharacterId,
          targetCharacterId: relationship.targetCharacterId,
          type: relationship.type,
          label: relationship.label,
          description: relationship.description,
          confidence: relationship.confidence,
          order: relationship.order ?? 0,
        })
        .onConflictDoNothing();
    }

    for (const message of messages) {
      await tx
        .insert(schema.contactMessages)
        .values({
          ...message,
          createdAt: toDate(message.createdAt),
          updatedAt: toDate(message.updatedAt),
        })
        .onConflictDoUpdate({
          target: schema.contactMessages.id,
          set: {
            name: message.name,
            email: message.email,
            subject: message.subject,
            message: message.message,
            status: message.status,
            updatedAt: toDate(message.updatedAt),
          },
        });
    }

    await tx
      .insert(schema.siteSettings)
      .values({
        key: "home-featured",
        value: settings,
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.siteSettings.key,
        set: {
          value: settings,
          updatedAt: new Date().toISOString(),
        },
      });
  });

  for (const character of characters) {
    await upsertMedia(`character:${character.id}:portrait`, character.portraitImage, character.name);
    await upsertMedia(`character:${character.id}:scene`, character.sceneImage, character.name);
  }
  for (const story of stories) {
    await upsertMedia(`story:${story.id}:cover`, story.coverImage, story.title);
    for (const section of story.sections) {
      await upsertMedia(`story-section:${section.id}:image`, section.image ?? "", section.title);
    }
    for (const scene of story.scenes) {
      await upsertMedia(`story-scene:${scene.id}:image`, scene.image, scene.title);
    }
  }

  console.log(
    `Seeded ${characters.length} characters, ${stories.length} stories, ${lineages.length} lineages, ${relationships.length} relationships, ${messages.length} contact messages.`,
  );
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
