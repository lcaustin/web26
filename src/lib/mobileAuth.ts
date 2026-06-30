import { SignJWT } from 'jose'
import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { Users } from '@/collections/Users'

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
 * Token lifetime is read directly from the Users collection's own auth
 * config so this can't drift out of sync again the way the old hardcoded
 * 7200-second constant did (Google sign-in kept issuing 2-hour tokens after
 * Users.ts was changed to 1 year, since nothing here referenced that value).
 */
const TOKEN_EXPIRATION_SECONDS =
  typeof Users.auth === 'object' && Users.auth.tokenExpiration ? Users.auth.tokenExpiration : 7200

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
