import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@/payload.config'

// One-time helper route to create the first admin (`users` collection) account,
// since `payload run` can't be used in this project (see memory/gotchas) and the
// /admin "create first user" screen requires the panel to be reachable. Visit
// /api/seed-admin once after `pnpm dev` is running, note the returned password,
// log in at /admin and change it immediately, then delete this route file.
// Disabled in production builds as a safety guard.

const ADMIN_EMAIL = 'haroosaree@gmail.com'
const ADMIN_PASSWORD = 'oo@xhA7qzCparQck'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seeding is disabled in production. Run this in development only.' },
      { status: 403 },
    )
  }

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN_EMAIL } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return NextResponse.json({
      message: `An account with ${ADMIN_EMAIL} already exists — log in at /admin. If you forgot the password, delete this user from the database or use Payload's password-reset flow.`,
      created: false,
    })
  }

  const user = await payload.create({
    collection: 'users',
    data: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  })

  return NextResponse.json({
    message:
      'Admin account created. Log in at /admin with the email and password below, then change the password immediately from your account settings.',
    created: true,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    id: user.id,
  })
}
