import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Legacy Sunday-sermon descriptions store the English title after their final
 * slash. Preserve it for the new video-card English-title field.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "videos"
    SET "title_en" = btrim(regexp_replace("description", '^.*/\\s*', ''))
    WHERE "admin_title" LIKE '%주일설교%'
      AND NULLIF(btrim("title_en"), '') IS NULL
      AND "description" LIKE '%/%'
      AND regexp_replace("description", '^.*/\\s*', '') ~ '[A-Za-z]';
  `)
}

// This migration only derives data from the existing description; it does not
// need to remove user-managed English titles when rolled back.
export async function down(_args: MigrateDownArgs): Promise<void> {}
