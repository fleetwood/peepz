ALTER TABLE "members" ADD COLUMN "auth_user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN IF EXISTS "password_hash";--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_auth_user_id_unique" UNIQUE("auth_user_id");