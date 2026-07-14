import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Adds the plain title Payload Admin requires for bilingual service names. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "service_times" ADD COLUMN IF NOT EXISTS "admin_title" varchar;
    UPDATE "service_times" SET "admin_title" = COALESCE("name_ko", "name_en", 'Service time')
      WHERE "admin_title" IS NULL OR "admin_title" = '';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "service_times" DROP COLUMN IF EXISTS "admin_title";
  `)
}
