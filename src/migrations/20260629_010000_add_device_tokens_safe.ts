import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Same situation as the google_id migration: the DeviceTokens collection was
// added to payload.config.ts for push-notification support, but production
// (which only syncs schema via dev-mode push, never in NODE_ENV=production)
// never got the device_tokens / device_tokens_texts tables or the
// payload_locked_documents_rels.device_tokens_id relationship column. This
// surfaced as "column ...device_tokens_id does not exist" when Payload tried
// to query payload_locked_documents_rels during a user create/update.
//
// Every statement here is guarded (IF NOT EXISTS, or a DO block catching
// duplicate_object) so this is safe to re-run even if partially applied.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_device_tokens_platform" AS ENUM('ios', 'android');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "device_tokens" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "token" varchar NOT NULL,
      "platform" "enum_device_tokens_platform" NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "device_tokens_texts" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "text" varchar
    );

    DO $$ BEGIN
      ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "device_tokens_texts" ADD CONSTRAINT "device_tokens_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."device_tokens"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "device_tokens_user_idx" ON "device_tokens" USING btree ("user_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "device_tokens_token_idx" ON "device_tokens" USING btree ("token");
    CREATE INDEX IF NOT EXISTS "device_tokens_updated_at_idx" ON "device_tokens" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "device_tokens_created_at_idx" ON "device_tokens" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "device_tokens_texts_order_parent" ON "device_tokens_texts" USING btree ("order","parent_id");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "device_tokens_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_device_tokens_fk" FOREIGN KEY ("device_tokens_id") REFERENCES "public"."device_tokens"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_device_tokens_id_idx" ON "payload_locked_documents_rels" USING btree ("device_tokens_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_device_tokens_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "device_tokens_id";
    DROP TABLE IF EXISTS "device_tokens_texts" CASCADE;
    DROP TABLE IF EXISTS "device_tokens" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_device_tokens_platform";
  `)
}
