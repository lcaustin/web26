import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Renames the archive category to the church's offering-song terminology. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "videos" SET "category" = 'offering-song' WHERE "category" = 'special-music';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "videos" SET "category" = 'special-music' WHERE "category" = 'offering-song';
  `)
}
