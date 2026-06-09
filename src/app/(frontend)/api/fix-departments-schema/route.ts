import { getPayload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import { NextResponse } from 'next/server'

import config from '@/payload.config'

// One-time helper route to fix a Postgres schema mismatch on the `departments`
// table: the `description` field was upgraded from plain bilingual text to a
// bilingual rich-text (Lexical/JSON) field, but Postgres can't auto-cast an
// existing `text` column to `jsonb` ("ALTER COLUMN ... SET DATA TYPE jsonb"
// fails). Since this field was just introduced and has no real content yet,
// the fix is to drop the old text columns so Payload's dev schema sync can
// recreate them with the correct jsonb type. Visit /api/fix-departments-schema
// once after `pnpm dev`/`pnpm devsafe` is running, then delete this route file.
// Disabled in production builds as a safety guard.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This fix is disabled in production. Run it in development only.' },
      { status: 403 },
    )
  }

  const payload = await getPayload({ config })
  const drizzle = (payload.db as { drizzle?: { execute: (q: unknown) => Promise<unknown> } }).drizzle

  if (!drizzle) {
    return NextResponse.json(
      { error: 'Could not access the underlying Postgres connection via payload.db.drizzle.' },
      { status: 500 },
    )
  }

  const dropped: string[] = []
  const skipped: string[] = []

  for (const column of ['description_ko', 'description_en']) {
    const existsResult = (await drizzle.execute(sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'departments' AND column_name = ${column}
      LIMIT 1
    `)) as { rows?: unknown[] }

    if (!existsResult.rows || existsResult.rows.length === 0) {
      skipped.push(column)
      continue
    }

    await drizzle.execute(sql.raw(`ALTER TABLE "departments" DROP COLUMN IF EXISTS "${column}"`))
    dropped.push(column)
  }

  return NextResponse.json({
    message:
      dropped.length > 0
        ? `Dropped old text column(s) ${dropped.join(', ')} from "departments". Reload /admin/collections/departments/create — Payload will recreate them as jsonb on the next schema sync.`
        : 'Nothing to drop — the description_ko/description_en columns are already gone or were never created as text.',
    dropped,
    skipped,
  })
}
