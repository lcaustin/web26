import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`ALTER TABLE media ADD COLUMN IF NOT EXISTS prefix varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`ALTER TABLE media DROP COLUMN IF EXISTS prefix;`)
}
