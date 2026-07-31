import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`ALTER TABLE room_reservations ADD COLUMN IF NOT EXISTS repeat_rule varchar DEFAULT 'none'; ALTER TABLE room_reservations ADD COLUMN IF NOT EXISTS repeat_until timestamptz;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`ALTER TABLE room_reservations DROP COLUMN IF EXISTS repeat_rule; ALTER TABLE room_reservations DROP COLUMN IF EXISTS repeat_until;`)
}
