import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE bible_studies DROP COLUMN IF EXISTS semester_option;
    ALTER TABLE bible_studies DROP COLUMN IF EXISTS semester_ko;
    ALTER TABLE bible_studies DROP COLUMN IF EXISTS semester_en;
    ALTER TABLE bible_study_signups DROP COLUMN IF EXISTS semester_option;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE bible_studies ADD COLUMN IF NOT EXISTS semester_ko varchar;
    ALTER TABLE bible_studies ADD COLUMN IF NOT EXISTS semester_en varchar;
    ALTER TABLE bible_studies ADD COLUMN IF NOT EXISTS semester_option varchar;
    ALTER TABLE bible_study_signups ADD COLUMN IF NOT EXISTS semester_option varchar;
  `)
}
