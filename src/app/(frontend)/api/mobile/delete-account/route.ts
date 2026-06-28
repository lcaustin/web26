import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@/payload.config'
import { getMobileUser } from '@/lib/mobileAuth'
import { handleOptions, withCors } from '@/lib/cors'

export function OPTIONS(request: Request) {
  return handleOptions(request)
}

// In-app account deletion, required by Apple App Store guidelines (5.1.1(v))
// for any app that supports account creation. Deletes the user's
// device-tokens docs and the user record itself.
export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const user = await getMobileUser(payload, request.headers)

  if (!user) {
    return withCors(request, NextResponse.json({ message: 'Unauthorized' }, { status: 401 }))
  }

  const tokens = await payload.find({
    collection: 'device-tokens',
    where: { user: { equals: user.id } },
    limit: 100,
  })

  await Promise.all(
    tokens.docs.map((doc) => payload.delete({ collection: 'device-tokens', id: doc.id })),
  )

  await payload.delete({ collection: 'users', id: user.id })

  return withCors(request, NextResponse.json({ ok: true }))
}
