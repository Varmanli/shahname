CREATE TYPE "public"."hero_content_position" AS ENUM('left', 'right');--> statement-breakpoint
CREATE TABLE "home_hero_slides" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"primary_button_label" text DEFAULT '' NOT NULL,
	"primary_button_href" text DEFAULT '' NOT NULL,
	"secondary_button_label" text DEFAULT '' NOT NULL,
	"secondary_button_href" text DEFAULT '' NOT NULL,
	"content_position" "hero_content_position" DEFAULT 'right' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
