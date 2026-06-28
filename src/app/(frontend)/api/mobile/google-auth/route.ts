import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

import config from '@/payload.config'
import { signMobileAuthToken } from '@/lib/mobileAuth'
import { handleOptions, withCors } from '@/lib/cors'

export function OPTIONS(request: Request) {
  return handleOptions(request)
}

// Verifies the Google ID token, then finds-or-creates a matching Payload user
// (matched first by googleId, falling back to email so an existing
// email/password account gets linked rather than duplicated). Returns a
// Payload-compatible session token — see src/lib/mobileAuth.ts for why this
// works without a password.
const GOOGLE_CLIENT_IDS = [
  process.env.GOOGLE_WEB_CLIENT_ID,
  process.env.GOOGLE_IOS_CLIENT_ID,
].filter(Boolean) as string[]

export async function POST(request: Request) {
  const { idToken } = await request.json().catch(() => ({}))

  if (!idToken || typeof idToken !== 'string') {
    return withCors(request, NextResponse.json({ message: 'idToken is required' }, { status: 400 }))
  }

  if (GOOGLE_CLIENT_IDS.length === 0) {
    return withCors(
      request,
      NextResponse.json(
        { message: 'Server is missing GOOGLE_WEB_CLIENT_ID / GOOGLE_IOS_CLIENT_ID' },
        { status: 500 },
      ),
    )
  }

  const client = new OAuth2Client()
  let payloadToken
  try {
    payloadToken = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_IDS,
    })
  } catch {
    return withCors(request, NextResponse.json({ message: 'Invalid Google ID token' }, { status: 401 }))
  }

  const ticket = payloadToken.getPayload()
  const googleId = ticket?.sub
  const email = ticket?.email

  if (!googleId || !email) {
    return withCors(
      request,
      NextResponse.json({ message: 'Google token missing sub/email' }, { status: 400 }),
    )
  }

  const payload = await getPayload({ config })

  const byGoogleId = await payload.find({
    collection: 'users',
    where: { googleId: { equals: googleId } },
    limit: 1,
  })

  let user = byGoogleId.docs[0]

  if (!user) {
    const byEmail = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (byEmail.docs[0]) {
      user = await payload.update({
        collection: 'users',
        id: byEmail.docs[0].id,
        data: { googleId },
      })
    } else {
      user = await payload.create({
        collection: 'users',
        data: {
          email,
          name: ticket?.name || '',
          googleId,
          // Random password: this account only ever authenticates via Google,
          // but Payload's `auth: true` collections require a password field.
          password: crypto.randomUUID() + crypto.randomUUID(),
        },
      })
    }
  }

  const { token } = await signMobileAuthToken(user)

  return withCors(request, NextResponse.json({ user, token }))
}
