import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Adds the PDF-backed weekly bulletin collection to an existing Payload database. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "bulletins" (
      "id" serial PRIMARY KEY NOT NULL,
      "admin_title" varchar,
      "issue_date" timestamp(3) with time zone NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric
    );

    CREATE INDEX IF NOT EXISTS "bulletins_updated_at_idx" ON "bulletins" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "bulletins_created_at_idx" ON "bulletins" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "bulletins_issue_date_idx" ON "bulletins" USING btree ("issue_date");
    CREATE UNIQUE INDEX IF NOT EXISTS "bulletins_filename_idx" ON "bulletins" USING btree ("filename");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "bulletins_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_bulletins_fk"
        FOREIGN KEY ("bulletins_id") REFERENCES "public"."bulletins"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_bulletins_id_idx"
      ON "payload_locked_documents_rels" USING btree ("bulletins_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_bulletins_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "bulletins_id";
    DROP TABLE IF EXISTS "bulletins" CASCADE;
  `)
}
