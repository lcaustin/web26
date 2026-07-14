import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Stores an explicit display group for every service-time record. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_service_times_group" AS ENUM('sunday-worship', 'weekday-worship', 'next-generation');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    ALTER TABLE "service_times" ADD COLUMN IF NOT EXISTS "group" "enum_service_times_group";
    UPDATE "service_times"
    SET "group" = CASE
      WHEN "name_ko" IN ('주일 1부 예배', '주일 2부 예배', '주일 3부 예배') THEN 'sunday-worship'::"enum_service_times_group"
      WHEN "name_ko" IN ('새벽기도', '금요찬양예배', '토요비전예배') THEN 'weekday-worship'::"enum_service_times_group"
      ELSE 'next-generation'::"enum_service_times_group"
    END
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "service_times" DROP COLUMN IF EXISTS "group";`)
}
