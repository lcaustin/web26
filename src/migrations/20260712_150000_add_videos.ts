import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Adds the unified legacy-video archive (YouTube and Vimeo) to Payload. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "videos" (
      "id" serial PRIMARY KEY NOT NULL,
      "admin_title" varchar NOT NULL,
      "content_type" varchar NOT NULL DEFAULT 'other',
      "source" varchar NOT NULL,
      "video_id" varchar NOT NULL,
      "video_url" varchar NOT NULL,
      "thumbnail_url" varchar,
      "description" varchar,
      "tags" varchar,
      "legacy_category" varchar,
      "published_at" timestamp(3) with time zone NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "videos_source_video_id_idx" ON "videos" USING btree ("source", "video_id");
    CREATE INDEX IF NOT EXISTS "videos_content_type_published_at_idx" ON "videos" USING btree ("content_type", "published_at");
    CREATE INDEX IF NOT EXISTS "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "videos_created_at_idx" ON "videos" USING btree ("created_at");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "videos_id" integer;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_videos_fk"
        FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_videos_id_idx"
      ON "payload_locked_documents_rels" USING btree ("videos_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_videos_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "videos_id";
    DROP TABLE IF EXISTS "videos" CASCADE;
  `)
}
