ALTER TYPE "public"."page_view_target_type" ADD VALUE IF NOT EXISTS 'page';--> statement-breakpoint
DROP INDEX IF EXISTS "page_views_unique_visitor_idx";--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "path" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "view_date" date DEFAULT CURRENT_DATE NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "page_views_unique_visitor_idx" ON "page_views" USING btree ("target_type","target_id","ip_hash","view_date");