import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@/payload.config'

// One-time helper route to check whether any admin (`users` collection) accounts
// already exist in the database — useful for confirming whether you need to visit
// /admin to create your first user, or whether one is already set up. Returns only
// emails/roles/timestamps (never password hashes). Visit /api/check-admin once
// after `pnpm dev` is running, then feel free to delete this route file when done.
// Disabled in production builds as a safety guard.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This check is disabled in production. Run it in development only.' },
      { status: 403 },
    )
  }

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'users',
    limit: 50,
    depth: 0,
  })

  const users = result.docs.map((u) => ({
    id: u.id,
    email: u.email,
    createdAt: u.createdAt,
  }))

  return NextResponse.json({
    message:
      users.length > 0
        ? `Found ${users.length} existing admin user(s) — log in at /admin with one of these emails.`
        : 'No admin users found yet — visit /admin to create your first user.',
    count: users.length,
    users,
  })
}
