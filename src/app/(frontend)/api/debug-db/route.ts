import { NextResponse } from 'next/server'

// TEMPORARY diagnostic route — delete this file once the DATABASE_URI mismatch
// between local .env and Vercel's actual production database is resolved.
// Returns only a masked (host/db-name only, no credentials) view of what
// process.env.DATABASE_URI actually resolves to at runtime in this deployment,
// since the Vercel dashboard's displayed value couldn't be confirmed visually.
export async function GET() {
  const raw = process.env.DATABASE_URI || ''

  let masked = '(empty)'
  if (raw) {
    try {
      const url = new URL(raw)
      masked = `${url.protocol}//${url.username ? url.username + ':***@' : ''}${url.host}${url.pathname}${url.search}`
    } catch {
      masked = '(unparseable connection string, length ' + raw.length + ')'
    }
  }

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    databaseUriLength: raw.length,
    databaseUriMasked: masked,
  })
}
