import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Adds the optional English title shown below each video title. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "title_en" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "videos" DROP COLUMN IF EXISTS "title_en";
  `)
}
