import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const characterVisualRoleEnum = pgEnum("character_visual_role", [
  "king",
  "queen",
  "hero",
  "sage",
  "royal-family",
  "notable",
]);

export const characterRelationTypeEnum = pgEnum("character_relation_type", [
  "father",
  "mother",
  "child",
  "spouse",
  "sibling",
  "ancestor",
  "descendant",
]);

export const relationshipTypeEnum = pgEnum("relationship_type", [
  "parent_child",
  "spouse",
  "indirect_lineage",
  "ally",
  "other",
]);

export const relationshipConfidenceEnum = pgEnum("relationship_confidence", [
  "confirmed",
  "inferred",
  "legendary",
]);

export const contactMessageStatusEnum = pgEnum("contact_message_status", [
  "new",
  "read",
  "archived",
]);

export const storyStatusEnum = pgEnum("story_status", [
  "draft",
  "published",
  "archived",
]);

export const pageViewTargetTypeEnum = pgEnum("page_view_target_type", [
  "character",
  "story",
  // بازدید عمومی صفحه‌ها (خانه، آرشیوها، درباره، تماس و...) برای آمار سراسری سایت
  "page",
]);

export const heroContentPositionEnum = pgEnum("hero_content_position", [
  "left",
  "right",
]);

const createdAt = timestamp("created_at", { withTimezone: true, mode: "string" })
  .notNull()
  .defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true, mode: "string" })
  .notNull()
  .defaultNow();

export const lineages = pgTable("lineages", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  isApproved: boolean("is_approved").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt,
  updatedAt,
});

export const characters = pgTable(
  "characters",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    title: text("title").notNull().default(""),
    epithets: jsonb("epithets").$type<string[]>().notNull().default([]),
    role: text("role").notNull().default(""),
    visualRole: characterVisualRoleEnum("visual_role"),
    nationality: text("nationality").notNull().default(""),
    nameMeaning: text("name_meaning").notNull().default(""),
    father: text("father"),
    mother: text("mother"),
    fatherId: text("father_id"),
    motherId: text("mother_id"),
    spouseIds: jsonb("spouse_ids").$type<string[]>().notNull().default([]),
    childrenIds: jsonb("children_ids").$type<string[]>().notNull().default([]),
    siblingIds: jsonb("sibling_ids").$type<string[]>().notNull().default([]),
    dynasty: text("dynasty").notNull().default(""),
    lineageGroup: text("lineage_group").notNull().default(""),
    lineageId: text("lineage_id").references(() => lineages.id, {
      onDelete: "set null",
    }),
    enemies: jsonb("enemies").$type<string[]>().notNull().default([]),
    shortDescription: text("short_description").notNull().default(""),
    fullDescription: text("full_description").notNull().default(""),
    traits: jsonb("traits")
      .$type<Array<{ key: string; level: number; featured?: boolean }>>()
      .notNull()
      .default([]),
    achievements: jsonb("achievements").$type<string[]>().notNull().default([]),
    quote: text("quote").notNull().default(""),
    avatarUrl: text("avatar_url").notNull().default(""),
    portraitImage: text("portrait_image").notNull().default(""),
    sceneImage: text("scene_image").notNull().default(""),
    order: integer("order").notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex("characters_slug_idx").on(table.slug)],
);

export const stories = pgTable(
  "stories",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull().default(""),
    summary: text("summary").notNull().default(""),
    shortDescription: text("short_description").notNull().default(""),
    content: text("content").notNull().default(""),
    coverImage: text("cover_image").notNull().default(""),
    quote: text("quote").notNull().default(""),
    status: storyStatusEnum("status").notNull().default("published"),
    order: integer("order").notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex("stories_slug_idx").on(table.slug)],
);

export const storySections = pgTable("story_sections", {
  id: text("id").primaryKey(),
  storyId: text("story_id")
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  title: text("title").notNull().default(""),
  content: text("content").notNull().default(""),
  image: text("image"),
  order: integer("order").notNull().default(0),
  createdAt,
  updatedAt,
});

export const verses = pgTable("verses", {
  id: text("id").primaryKey(),
  storyId: text("story_id")
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  sectionId: text("section_id").references(() => storySections.id, {
    onDelete: "set null",
  }),
  text: text("text").notNull(),
  source: text("source"),
  order: integer("order").notNull().default(0),
});

export const storyCharacters = pgTable("story_characters", {
  id: text("id").primaryKey(),
  storyId: text("story_id")
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  characterId: text("character_id").references(() => characters.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  order: integer("order").notNull().default(0),
});

export const storyScenes = pgTable("story_scenes", {
  id: text("id").primaryKey(),
  storyId: text("story_id")
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  image: text("image").notNull(),
  title: text("title"),
  order: integer("order").notNull().default(0),
});

export const characterRelations = pgTable("character_relations", {
  id: text("id").primaryKey(),
  sourceCharacterId: text("source_character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  targetCharacterId: text("target_character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  type: characterRelationTypeEnum("type").notNull(),
  note: text("note"),
  order: integer("order").notNull().default(0),
  createdAt,
  updatedAt,
});

export const relationships = pgTable("relationships", {
  id: text("id").primaryKey(),
  sourceCharacterId: text("source_character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  targetCharacterId: text("target_character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  type: relationshipTypeEnum("type").notNull().default("other"),
  label: text("label"),
  description: text("description"),
  confidence: relationshipConfidenceEnum("confidence"),
  order: integer("order").notNull().default(0),
});

export const media = pgTable(
  "media",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    url: text("url").notNull(),
    mimeType: text("mime_type"),
    size: integer("size"),
    alt: text("alt"),
    createdAt,
  },
  (table) => [uniqueIndex("media_key_idx").on(table.key)],
);

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: contactMessageStatusEnum("status").notNull().default("new"),
  createdAt,
  updatedAt,
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt,
});

export const homeHeroSlides = pgTable("home_hero_slides", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  image: text("image").notNull().default(""),
  primaryButtonLabel: text("primary_button_label").notNull().default(""),
  primaryButtonHref: text("primary_button_href").notNull().default(""),
  secondaryButtonLabel: text("secondary_button_label").notNull().default(""),
  secondaryButtonHref: text("secondary_button_href").notNull().default(""),
  contentPosition: heroContentPositionEnum("content_position")
    .notNull()
    .default("right"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt,
  updatedAt,
});

export const pageViews = pgTable(
  "page_views",
  {
    id: text("id").primaryKey(),
    targetType: pageViewTargetTypeEnum("target_type").notNull(),
    // برای رکوردهای نوع page این فیلد همان مسیر صفحه است؛ برای داستان/شخصیت، شناسه آن.
    targetId: text("target_id").notNull(),
    // مسیر عمومی صفحه (مثلا «/stories» یا «/about»). برای آمار سراسری سایت.
    path: text("path").notNull().default(""),
    ipHash: text("ip_hash").notNull(),
    userAgent: text("user_agent").notNull().default(""),
    // روز بازدید برای حذف تکرار روزانه (هر بازدیدکننده در هر صفحه، روزی یک‌بار).
    viewDate: date("view_date", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_DATE`),
    viewedAt: timestamp("viewed_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("page_views_unique_visitor_idx").on(
      table.targetType,
      table.targetId,
      table.ipHash,
      table.viewDate,
    ),
  ],
);

export const lineageRelations = relations(lineages, ({ many }) => ({
  characters: many(characters),
}));

export const characterRelationsConfig = relations(characters, ({ one, many }) => ({
  lineage: one(lineages, {
    fields: [characters.lineageId],
    references: [lineages.id],
  }),
  relationsFrom: many(characterRelations, { relationName: "sourceCharacter" }),
  relationsTo: many(characterRelations, { relationName: "targetCharacter" }),
  relationshipsFrom: many(relationships, { relationName: "sourceRelationship" }),
  relationshipsTo: many(relationships, { relationName: "targetRelationship" }),
}));

export const storyRelations = relations(stories, ({ many }) => ({
  sections: many(storySections),
  characters: many(storyCharacters),
  scenes: many(storyScenes),
  verses: many(verses),
}));

export const storySectionRelations = relations(storySections, ({ one, many }) => ({
  story: one(stories, {
    fields: [storySections.storyId],
    references: [stories.id],
  }),
  verses: many(verses),
}));

export const verseRelations = relations(verses, ({ one }) => ({
  story: one(stories, {
    fields: [verses.storyId],
    references: [stories.id],
  }),
  section: one(storySections, {
    fields: [verses.sectionId],
    references: [storySections.id],
  }),
}));
