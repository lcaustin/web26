import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`ALTER TABLE bible_study_signups DROP COLUMN IF EXISTS status;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`ALTER TABLE bible_study_signups ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'pending';`)
}
