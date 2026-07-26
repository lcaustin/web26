import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "bible_studies"
      ADD COLUMN IF NOT EXISTS "signup_enabled" boolean NOT NULL DEFAULT false;

    UPDATE "bible_studies"
    SET "signup_enabled" = true
    WHERE "status" = 'active';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "bible_studies" DROP COLUMN IF EXISTS "signup_enabled";
  `)
}
