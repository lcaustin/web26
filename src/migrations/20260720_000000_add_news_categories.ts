import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "enum_news_category" AS ENUM ('youth', 'young-adults', 'elementary', 'preschool', 'nursery', 'english-ministry');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
    ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "category" "enum_news_category";
    CREATE INDEX IF NOT EXISTS "news_category_date_idx" ON "news" USING btree ("category", "date" DESC);

    UPDATE "news"
    SET "category" = CASE
      WHEN concat_ws(' ', "admin_title", "title_ko", coalesce("content_ko"::text, '')) ~* '(중고등부|\\myouth\\M)' THEN 'youth'
      WHEN concat_ws(' ', "admin_title", "title_ko", coalesce("content_ko"::text, '')) ~* '(대학[[:space:]]*청년부|대학부|청년부|young[[:space:]]*adults?)' THEN 'young-adults'
      WHEN concat_ws(' ', "admin_title", "title_ko", coalesce("content_ko"::text, '')) ~* '(초등부|\\melementary\\M)' THEN 'elementary'
      WHEN concat_ws(' ', "admin_title", "title_ko", coalesce("content_ko"::text, '')) ~* '(유아부|\\mpreschool\\M)' THEN 'preschool'
      WHEN concat_ws(' ', "admin_title", "title_ko", coalesce("content_ko"::text, '')) ~* '(영아부|\\mnursery\\M)' THEN 'nursery'
      WHEN concat_ws(' ', "admin_title", "title_ko", coalesce("content_ko"::text, '')) ~* '(english[[:space:]]*ministry|\\mEM\\M)' THEN 'english-ministry'
    END::"enum_news_category"
    WHERE "category" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "news_category_date_idx";
    ALTER TABLE "news" DROP COLUMN IF EXISTS "category";
    DROP TYPE IF EXISTS "enum_news_category";
  `)
}
