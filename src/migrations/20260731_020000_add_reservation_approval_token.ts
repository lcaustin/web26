import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> { await db.execute(`ALTER TABLE room_reservations ADD COLUMN IF NOT EXISTS approval_token varchar; CREATE UNIQUE INDEX IF NOT EXISTS room_reservations_approval_token_idx ON room_reservations (approval_token);`) }
export async function down({ db }: MigrateDownArgs): Promise<void> { await db.execute(`DROP INDEX IF EXISTS room_reservations_approval_token_idx; ALTER TABLE room_reservations DROP COLUMN IF EXISTS approval_token;`) }
