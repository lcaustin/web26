import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`ALTER TABLE bible_studies ALTER COLUMN course_type TYPE varchar USING course_type::text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`ALTER TABLE bible_studies ALTER COLUMN course_type TYPE text USING course_type::text;`)
}
