import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Makes the source video category a first-class `category` field. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "videos" RENAME COLUMN "legacy_category" TO "category";
    EXCEPTION
      WHEN undefined_column THEN null;
      WHEN duplicate_column THEN null;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "videos" RENAME COLUMN "category" TO "legacy_category";
    EXCEPTION
      WHEN undefined_column THEN null;
      WHEN duplicate_column THEN null;
    END $$;
  `)
}
