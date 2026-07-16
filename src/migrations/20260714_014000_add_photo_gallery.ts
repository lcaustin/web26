import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "photo_albums" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "legacy_key" varchar NOT NULL,
      "description" varchar,
      "tags" varchar,
      "event_date" timestamptz,
      "cover_image_url" varchar,
      "image_count" numeric DEFAULT 0,
      "updated_at" timestamptz(3) DEFAULT now() NOT NULL,
      "created_at" timestamptz(3) DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "photo_albums_slug_idx" ON "photo_albums" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "photo_albums_legacy_key_idx" ON "photo_albums" USING btree ("legacy_key");

    CREATE TABLE IF NOT EXISTS "photo_items" (
      "id" serial PRIMARY KEY NOT NULL,
      "legacy_id" varchar NOT NULL,
      "album_id" integer NOT NULL,
      "image_url" varchar NOT NULL,
      "sort_order" numeric DEFAULT 0 NOT NULL,
      "event_date" timestamptz,
      "updated_at" timestamptz(3) DEFAULT now() NOT NULL,
      "created_at" timestamptz(3) DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "photo_items_legacy_id_idx" ON "photo_items" USING btree ("legacy_id");
    CREATE INDEX IF NOT EXISTS "photo_items_album_id_idx" ON "photo_items" USING btree ("album_id");
    CREATE INDEX IF NOT EXISTS "photo_items_sort_order_idx" ON "photo_items" USING btree ("sort_order");
    DO $$ BEGIN
      ALTER TABLE "photo_items" ADD CONSTRAINT "photo_items_album_id_photo_albums_id_fk"
      FOREIGN KEY ("album_id") REFERENCES "public"."photo_albums"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "photo_items" CASCADE;
    DROP TABLE IF EXISTS "photo_albums" CASCADE;
  `)
}
