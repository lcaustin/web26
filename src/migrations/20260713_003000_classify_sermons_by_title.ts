import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** A sermon is determined solely by the Korean 설교 text in its title. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "videos"
    SET "category" = CASE
      WHEN "admin_title" LIKE '%설교%' THEN 'sermon'
      WHEN "category" = 'sermon' THEN 'other'
      ELSE "category"
    END
    WHERE "category" = 'sermon' OR "admin_title" LIKE '%설교%';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The old broad classification cannot be reconstructed safely.
}
