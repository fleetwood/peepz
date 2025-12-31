CREATE TABLE IF NOT EXISTS "auth_identity_link_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"member_id" uuid NOT NULL,
	"provider" varchar(64) NOT NULL,
	"provider_user_id" varchar(255) NOT NULL,
	"provider_email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_identity_link_requests" ADD CONSTRAINT "auth_identity_link_requests_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "auth_identity_link_requests_token_unique" ON "auth_identity_link_requests" USING btree ("token");