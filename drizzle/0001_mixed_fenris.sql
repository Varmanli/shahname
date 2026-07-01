CREATE TYPE "public"."page_view_target_type" AS ENUM('character', 'story');--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" text PRIMARY KEY NOT NULL,
	"target_type" "page_view_target_type" NOT NULL,
	"target_id" text NOT NULL,
	"ip_hash" text NOT NULL,
	"user_agent" text DEFAULT '' NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "page_views_unique_visitor_idx" ON "page_views" USING btree ("target_type","target_id","ip_hash");