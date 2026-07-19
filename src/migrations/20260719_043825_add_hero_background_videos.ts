import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Stores the ordered YouTube playlist used behind the homepage hero. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings_hero_background_videos" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "youtube_id" varchar NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "site_settings_hero_background_videos"
        ADD CONSTRAINT "site_settings_hero_background_videos_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "site_settings_hero_background_videos_order_idx"
      ON "site_settings_hero_background_videos" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_hero_background_videos_parent_id_idx"
      ON "site_settings_hero_background_videos" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "site_settings_hero_background_videos" CASCADE;
  `)
}
