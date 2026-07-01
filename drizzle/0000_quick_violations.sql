CREATE TYPE "public"."character_relation_type" AS ENUM('father', 'mother', 'child', 'spouse', 'sibling', 'ancestor', 'descendant');--> statement-breakpoint
CREATE TYPE "public"."character_visual_role" AS ENUM('king', 'queen', 'hero', 'sage', 'royal-family', 'notable');--> statement-breakpoint
CREATE TYPE "public"."contact_message_status" AS ENUM('new', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."relationship_confidence" AS ENUM('confirmed', 'inferred', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."relationship_type" AS ENUM('parent_child', 'spouse', 'indirect_lineage', 'ally', 'other');--> statement-breakpoint
CREATE TYPE "public"."story_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "character_relations" (
	"id" text PRIMARY KEY NOT NULL,
	"source_character_id" text NOT NULL,
	"target_character_id" text NOT NULL,
	"type" character_relation_type NOT NULL,
	"note" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"epithets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"visual_role" character_visual_role,
	"nationality" text DEFAULT '' NOT NULL,
	"name_meaning" text DEFAULT '' NOT NULL,
	"father" text,
	"mother" text,
	"father_id" text,
	"mother_id" text,
	"spouse_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"children_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sibling_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dynasty" text DEFAULT '' NOT NULL,
	"lineage_group" text DEFAULT '' NOT NULL,
	"lineage_id" text,
	"enemies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"short_description" text DEFAULT '' NOT NULL,
	"full_description" text DEFAULT '' NOT NULL,
	"traits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"achievements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quote" text DEFAULT '' NOT NULL,
	"avatar_url" text DEFAULT '' NOT NULL,
	"portrait_image" text DEFAULT '' NOT NULL,
	"scene_image" text DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "contact_message_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lineages" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"url" text NOT NULL,
	"mime_type" text,
	"size" integer,
	"alt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"source_character_id" text NOT NULL,
	"target_character_id" text NOT NULL,
	"type" "relationship_type" DEFAULT 'other' NOT NULL,
	"label" text,
	"description" text,
	"confidence" "relationship_confidence",
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"short_description" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"cover_image" text DEFAULT '' NOT NULL,
	"quote" text DEFAULT '' NOT NULL,
	"status" "story_status" DEFAULT 'published' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_characters" (
	"id" text PRIMARY KEY NOT NULL,
	"story_id" text NOT NULL,
	"character_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_scenes" (
	"id" text PRIMARY KEY NOT NULL,
	"story_id" text NOT NULL,
	"image" text NOT NULL,
	"title" text,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"story_id" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"image" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verses" (
	"id" text PRIMARY KEY NOT NULL,
	"story_id" text NOT NULL,
	"section_id" text,
	"text" text NOT NULL,
	"source" text,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "character_relations" ADD CONSTRAINT "character_relations_source_character_id_characters_id_fk" FOREIGN KEY ("source_character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_relations" ADD CONSTRAINT "character_relations_target_character_id_characters_id_fk" FOREIGN KEY ("target_character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_lineage_id_lineages_id_fk" FOREIGN KEY ("lineage_id") REFERENCES "public"."lineages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_source_character_id_characters_id_fk" FOREIGN KEY ("source_character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_target_character_id_characters_id_fk" FOREIGN KEY ("target_character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_characters" ADD CONSTRAINT "story_characters_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_characters" ADD CONSTRAINT "story_characters_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_scenes" ADD CONSTRAINT "story_scenes_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_sections" ADD CONSTRAINT "story_sections_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verses" ADD CONSTRAINT "verses_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verses" ADD CONSTRAINT "verses_section_id_story_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."story_sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "characters_slug_idx" ON "characters" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "media_key_idx" ON "media" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "stories_slug_idx" ON "stories" USING btree ("slug");