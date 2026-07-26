import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS bible_study_semesters (
      id serial PRIMARY KEY,
      name varchar NOT NULL UNIQUE,
      "order" numeric DEFAULT 0,
      updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
      created_at timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    ALTER TABLE bible_studies ADD COLUMN IF NOT EXISTS semester_option varchar;
    ALTER TABLE bible_studies ADD COLUMN IF NOT EXISTS semester_ref_id integer;
    ALTER TABLE bible_study_signups ADD COLUMN IF NOT EXISTS semester_option varchar;
    ALTER TABLE bible_study_signups ADD COLUMN IF NOT EXISTS semester_ref_id integer;
    CREATE INDEX IF NOT EXISTS bible_studies_semester_ref_idx ON bible_studies (semester_ref_id);
    CREATE INDEX IF NOT EXISTS bible_study_signups_semester_ref_idx ON bible_study_signups (semester_ref_id);
    DO $$ BEGIN
      ALTER TABLE bible_studies ADD CONSTRAINT bible_studies_semester_ref_fk FOREIGN KEY (semester_ref_id) REFERENCES bible_study_semesters(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE bible_study_signups ADD CONSTRAINT bible_study_signups_semester_ref_fk FOREIGN KEY (semester_ref_id) REFERENCES bible_study_semesters(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE bible_study_signups DROP COLUMN IF EXISTS semester_ref_id;
    ALTER TABLE bible_study_signups DROP COLUMN IF EXISTS semester_option;
    ALTER TABLE bible_studies DROP COLUMN IF EXISTS semester_ref_id;
    ALTER TABLE bible_studies DROP COLUMN IF EXISTS semester_option;
    DROP TABLE IF EXISTS bible_study_semesters;
  `)
}
