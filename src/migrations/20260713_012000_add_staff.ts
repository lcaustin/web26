import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Adds the admin-managed church staff directory. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_staff_group" AS ENUM('pastoral', 'ministry', 'church-leaders');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "staff" (
      "id" serial PRIMARY KEY NOT NULL,
      "admin_title" varchar,
      "legacy_id" varchar,
      "legacy_index" numeric,
      "name_ko" varchar,
      "name_en" varchar,
      "role_ko" varchar,
      "role_en" varchar,
      "group" "enum_staff_group" NOT NULL DEFAULT 'pastoral',
      "photo_id" integer,
      "image_url" varchar,
      "back_image_url" varchar,
      "status_ko" varchar,
      "status_en" varchar,
      "email" varchar,
      "order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "staff"
        ADD CONSTRAINT "staff_photo_id_media_id_fk"
        FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "staff_group_order_idx" ON "staff" USING btree ("group", "order", "legacy_index");
    CREATE UNIQUE INDEX IF NOT EXISTS "staff_legacy_id_idx" ON "staff" USING btree ("legacy_id");
    CREATE INDEX IF NOT EXISTS "staff_photo_idx" ON "staff" USING btree ("photo_id");
    CREATE INDEX IF NOT EXISTS "staff_updated_at_idx" ON "staff" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "staff_created_at_idx" ON "staff" USING btree ("created_at");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "staff_id" integer;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_staff_fk"
        FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_staff_id_idx"
      ON "payload_locked_documents_rels" USING btree ("staff_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_staff_id_idx";
    DROP INDEX IF EXISTS "staff_legacy_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "staff_id";
    DROP TABLE IF EXISTS "staff" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_staff_group";
  `)
}
