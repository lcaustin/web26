import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`ALTER TABLE bible_study_semesters ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`ALTER TABLE bible_study_semesters DROP COLUMN IF EXISTS active;`)
}
