import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Separates Payload CMS administrators from mobile/member accounts.
 * Only the two existing staff accounts are elevated during this migration.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_admin" boolean NOT NULL DEFAULT false;
    CREATE INDEX IF NOT EXISTS "users_is_admin_idx" ON "users" USING btree ("is_admin");

    UPDATE "users"
    SET "is_admin" = true
    WHERE "email" IN ('haroosaree@gmail.com', 'alex.media@lcaustin.org');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "users_is_admin_idx";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "is_admin";
  `)
}
