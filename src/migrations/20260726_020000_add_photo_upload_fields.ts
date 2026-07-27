import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE photo_items ADD COLUMN IF NOT EXISTS image_id integer;
    ALTER TABLE photo_albums ADD COLUMN IF NOT EXISTS cover_image_id integer;
    DO $$ BEGIN
      ALTER TABLE photo_items ADD CONSTRAINT photo_items_image_id_fk FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE photo_albums ADD CONSTRAINT photo_albums_cover_image_id_fk FOREIGN KEY (cover_image_id) REFERENCES media(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE INDEX IF NOT EXISTS photo_items_image_idx ON photo_items (image_id);
    CREATE INDEX IF NOT EXISTS photo_albums_cover_image_idx ON photo_albums (cover_image_id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE photo_items DROP COLUMN IF EXISTS image_id;
    ALTER TABLE photo_albums DROP COLUMN IF EXISTS cover_image_id;
  `)
}
