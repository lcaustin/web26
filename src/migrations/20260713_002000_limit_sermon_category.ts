import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Keeps the sermon archive limited to explicitly identified Sunday sermons. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "videos"
    SET "category" = 'other'
    WHERE "category" = 'sermon'
      AND COALESCE("tags", '') NOT ILIKE '%주일설교%'
      AND "admin_title" NOT ILIKE '%주일설교%'
      AND "admin_title" NOT ILIKE '%Sunday Sermon%';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // This reclassification is intentionally not reversible: `other` also
  // contains records that were never sermons in the legacy archive.
}
