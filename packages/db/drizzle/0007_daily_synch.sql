ALTER TABLE "groups" ADD COLUMN "stub" text;--> statement-breakpoint
ALTER TABLE "families" DROP COLUMN IF EXISTS "stub";