import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE bible_studies ALTER COLUMN title_ko DROP NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN title_en DROP NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN target_group_ko DROP NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN target_group_en DROP NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN start_date DROP NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN location_ko DROP NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN location_en DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE bible_studies ALTER COLUMN title_ko SET NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN title_en SET NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN target_group_ko SET NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN target_group_en SET NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN start_date SET NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN location_ko SET NOT NULL;
    ALTER TABLE bible_studies ALTER COLUMN location_en SET NOT NULL;
  `)
}
