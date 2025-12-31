CREATE TABLE IF NOT EXISTS "auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"member_id" uuid NOT NULL,
	"provider" varchar(64) NOT NULL,
	"provider_user_id" varchar(255) NOT NULL,
	"email" varchar(255),
	"raw_profile" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "persons" ADD COLUMN "first_name" varchar(255);--> statement-breakpoint
ALTER TABLE "persons" ADD COLUMN "last_name" varchar(255);--> statement-breakpoint
ALTER TABLE "persons" ADD COLUMN "avatar_url" varchar(2048);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_identities_provider_provider_user_id_unique" ON "auth_identities" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_identities_member_provider_unique" ON "auth_identities" USING btree ("member_id","provider");