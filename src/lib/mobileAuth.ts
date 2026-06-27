import { SignJWT } from 'jose'
import type { Payload } from 'payload'
import type { User } from '@/payload-types'

/**
 * Signs a Payload-compatible session JWT for a given user, without requiring
 * a password. This mirrors exactly what Payload's own `/api/users/login`
 * endpoint signs internally (see payload/dist/auth/jwt.js + getFieldsToSign.js):
 * `{ id, collection, email }`, HS256, signed with `PAYLOAD_SECRET`.
 *
 * Payload's built-in JWT auth strategy only verifies the signature and decodes
 * these fields — it doesn't care how the token was produced — so a token
 * signed here is accepted by every existing Payload REST/GraphQL route
 * exactly like one issued through password login. This is what lets the
 * mobile app's Google sign-in flow (which has no password to check) end up
 * with a normal, fully-functional Payload session.
 *
 * Token lifetime matches Payload's default `auth.tokenExpiration` (2 hours,
 * in seconds) since the Users collection doesn't override it. If that ever
 * changes in src/collections/Users.ts, update TOKEN_EXPIRATION_SECONDS too.
 */
const TOKEN_EXPIRATION_SECONDS = 7200

export async function signMobileAuthToken(user: Pick<User, 'id' | 'email'>) {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is not set')
  }

  const issuedAt = Math.floor(Date.now() / 1000)
  const exp = issuedAt + TOKEN_EXPIRATION_SECONDS

  const token = await new SignJWT({
    id: user.id,
    collection: 'users',
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(issuedAt)
    .setExpirationTime(exp)
    .sign(new TextEncoder().encode(secret))

  return { token, exp }
}

/** Authenticates an incoming mobile API request and returns the Payload user, or null. */
export async function getMobileUser(payload: Payload, headers: Headers): Promise<User | null> {
  const { user } = await payload.auth({ headers })
  return (user as User) ?? null
}
