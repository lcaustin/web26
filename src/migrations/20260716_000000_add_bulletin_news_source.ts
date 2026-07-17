import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "source_bulletin_id" integer;
    ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "extraction_key" varchar;
    CREATE UNIQUE INDEX IF NOT EXISTS "news_extraction_key_idx" ON "news" USING btree ("extraction_key");
    CREATE INDEX IF NOT EXISTS "news_source_bulletin_id_idx" ON "news" USING btree ("source_bulletin_id");
    DO $$ BEGIN
      ALTER TABLE "news" ADD CONSTRAINT "news_source_bulletin_id_bulletins_id_fk"
      FOREIGN KEY ("source_bulletin_id") REFERENCES "public"."bulletins"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "news" DROP CONSTRAINT IF EXISTS "news_source_bulletin_id_bulletins_id_fk";
    DROP INDEX IF EXISTS "news_source_bulletin_id_idx";
    DROP INDEX IF EXISTS "news_extraction_key_idx";
    ALTER TABLE "news" DROP COLUMN IF EXISTS "source_bulletin_id";
    ALTER TABLE "news" DROP COLUMN IF EXISTS "extraction_key";
  `)
}
