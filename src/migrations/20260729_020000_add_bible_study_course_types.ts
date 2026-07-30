import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS bible_study_course_types (
      id serial PRIMARY KEY,
      admin_title varchar,
      name_ko varchar NOT NULL,
      name_en varchar,
      slug varchar NOT NULL UNIQUE,
      "order" numeric DEFAULT 0,
      updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
      created_at timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    ALTER TABLE bible_studies ADD COLUMN IF NOT EXISTS course_type_ref_id integer;
    CREATE INDEX IF NOT EXISTS bible_studies_course_type_ref_idx ON bible_studies (course_type_ref_id);
    DO $$ BEGIN
      ALTER TABLE bible_studies ADD CONSTRAINT bible_studies_course_type_ref_fk FOREIGN KEY (course_type_ref_id) REFERENCES bible_study_course_types(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE bible_studies DROP COLUMN IF EXISTS course_type_ref_id;
    DROP TABLE IF EXISTS bible_study_course_types;
  `)
}
