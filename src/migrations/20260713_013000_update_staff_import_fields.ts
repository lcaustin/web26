import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Makes the initial Staff table compatible with the legacy Korean-only directory import. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_staff_group" ADD VALUE IF NOT EXISTS 'church-leaders';
    ALTER TABLE "staff"
      ALTER COLUMN "name_ko" DROP NOT NULL,
      ALTER COLUMN "name_en" DROP NOT NULL,
      ALTER COLUMN "role_ko" DROP NOT NULL,
      ALTER COLUMN "role_en" DROP NOT NULL,
      ADD COLUMN IF NOT EXISTS "legacy_id" varchar,
      ADD COLUMN IF NOT EXISTS "legacy_index" numeric,
      ADD COLUMN IF NOT EXISTS "image_url" varchar,
      ADD COLUMN IF NOT EXISTS "back_image_url" varchar,
      ADD COLUMN IF NOT EXISTS "status_ko" varchar,
      ADD COLUMN IF NOT EXISTS "status_en" varchar;
    CREATE UNIQUE INDEX IF NOT EXISTS "staff_legacy_id_idx" ON "staff" USING btree ("legacy_id");
    DROP INDEX IF EXISTS "staff_group_order_idx";
    CREATE INDEX IF NOT EXISTS "staff_group_order_idx" ON "staff" USING btree ("group", "order", "legacy_index");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "staff"
      DROP COLUMN IF EXISTS "status_en",
      DROP COLUMN IF EXISTS "status_ko",
      DROP COLUMN IF EXISTS "back_image_url",
      DROP COLUMN IF EXISTS "image_url",
      DROP COLUMN IF EXISTS "legacy_index",
      DROP COLUMN IF EXISTS "legacy_id";
    DROP INDEX IF EXISTS "staff_legacy_id_idx";
  `)
}
