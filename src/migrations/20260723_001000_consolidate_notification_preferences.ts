import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Moves user notification choices from seven booleans into one JSON array. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences" jsonb NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_adult" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_youth" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_elementary" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_college_young_adult" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_preschool" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_nursery" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_english_ministry" boolean DEFAULT false;

    UPDATE "users"
    SET "notification_preferences" = to_jsonb(array_remove(ARRAY[
      CASE WHEN "notification_preferences_adult" THEN 'adult' END,
      CASE WHEN "notification_preferences_youth" THEN 'youth' END,
      CASE WHEN "notification_preferences_elementary" THEN 'elementary' END,
      CASE WHEN "notification_preferences_college_young_adult" THEN 'collegeYoungAdult' END,
      CASE WHEN "notification_preferences_preschool" THEN 'preschool' END,
      CASE WHEN "notification_preferences_nursery" THEN 'nursery' END,
      CASE WHEN "notification_preferences_english_ministry" THEN 'englishMinistry' END
    ]::text[], NULL))
    WHERE COALESCE("notification_preferences_adult", false)
      OR COALESCE("notification_preferences_youth", false)
      OR COALESCE("notification_preferences_elementary", false)
      OR COALESCE("notification_preferences_college_young_adult", false)
      OR COALESCE("notification_preferences_preschool", false)
      OR COALESCE("notification_preferences_nursery", false)
      OR COALESCE("notification_preferences_english_ministry", false);

    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_adult";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_youth";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_elementary";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_college_young_adult";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_preschool";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_nursery";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences_english_ministry";
    DROP TABLE IF EXISTS "device_tokens_texts";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_adult" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_youth" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_elementary" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_college_young_adult" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_preschool" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_nursery" boolean DEFAULT false;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences_english_ministry" boolean DEFAULT false;
    UPDATE "users" SET
      "notification_preferences_adult" = "notification_preferences" ? 'adult',
      "notification_preferences_youth" = "notification_preferences" ? 'youth',
      "notification_preferences_elementary" = "notification_preferences" ? 'elementary',
      "notification_preferences_college_young_adult" = "notification_preferences" ? 'collegeYoungAdult',
      "notification_preferences_preschool" = "notification_preferences" ? 'preschool',
      "notification_preferences_nursery" = "notification_preferences" ? 'nursery',
      "notification_preferences_english_ministry" = "notification_preferences" ? 'englishMinistry';
    ALTER TABLE "users" DROP COLUMN IF EXISTS "notification_preferences";
  `)
}
