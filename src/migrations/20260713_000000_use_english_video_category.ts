import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Replaces the duplicated content_type with the English-facing category field. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'videos' AND column_name = 'content_type') THEN
        UPDATE "videos" SET "category" = "content_type";
        ALTER TABLE "videos" DROP COLUMN "content_type";
      END IF;
    END $$;
    CREATE INDEX IF NOT EXISTS "videos_category_published_at_idx" ON "videos" USING btree ("category", "published_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "content_type" varchar;
    UPDATE "videos" SET "content_type" = "category" WHERE "content_type" IS NULL;
  `)
}
