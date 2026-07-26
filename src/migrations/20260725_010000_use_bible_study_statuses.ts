import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ req }: MigrateUpArgs): Promise<void> {
  await req.payload.db.drizzle.execute(`
    UPDATE bible_studies SET status = 'open' WHERE status = 'active';
    UPDATE bible_studies SET status = 'before' WHERE status = 'draft';
    UPDATE bible_studies SET status = 'closed' WHERE status = 'completed';
    ALTER TABLE bible_studies DROP COLUMN IF EXISTS signup_enabled;
  `)
}

export async function down({ req }: MigrateDownArgs): Promise<void> {
  await req.payload.db.drizzle.execute(`
    ALTER TABLE bible_studies ADD COLUMN IF NOT EXISTS signup_enabled boolean NOT NULL DEFAULT false;
  `)
}
