import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS reservations_admin_email varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`ALTER TABLE site_settings DROP COLUMN IF EXISTS reservations_admin_email;`)
}
