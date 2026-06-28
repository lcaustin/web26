import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Hand-written, idempotent migration. The auto-generated first migration
// (since deleted) tried to CREATE TABLE every collection from scratch —
// that's a known quirk of migration tools that diff against migration
// history rather than the live database, and it's unsafe to run against a
// database that already has real data, since CREATE TABLE on an existing
// table errors out. This migration only adds what's actually missing:
// the `google_id` column (+ its unique index) used by Google sign-in, plus
// the notification preference columns. All statements use IF NOT EXISTS so
// re-running this is always safe even if partially applied already.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" varchar;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_adult" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_youth" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_elementary" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_college_young_adult" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_preschool" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_nursery" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_english_ministry" boolean DEFAULT false;
    CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_idx" ON "users" USING btree ("google_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "users_google_id_idx";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "google_id";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_adult";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_youth";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_elementary";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_college_young_adult";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_preschool";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_nursery";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_english_ministry";
  `)
}
