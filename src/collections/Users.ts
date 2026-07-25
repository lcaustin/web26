import type { CollectionConfig } from 'payload'
import { NOTIFICATION_TOPICS } from '../lib/notificationTopics.ts'

type UserWithAdminFlag = { isAdmin?: boolean } | null | undefined

const isAdmin = (user: UserWithAdminFlag) => user?.isAdmin === true

function normalizeNotificationPreferences(value: unknown) {
  if (Array.isArray(value)) return value.filter((topic): topic is string => typeof topic === 'string' && NOTIFICATION_TOPICS.includes(topic as typeof NOTIFICATION_TOPICS[number]))
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([topic, enabled]) => enabled && NOTIFICATION_TOPICS.includes(topic as typeof NOTIFICATION_TOPICS[number]) ? [topic] : [])
  }
  return []
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Only designated staff accounts may enter Payload Admin. Google/mobile
    // members remain authenticated users, but cannot manage CMS content.
    admin: ({ req }) => isAdmin(req.user as UserWithAdminFlag),
    // Members can register through the mobile app's public email/password
    // endpoint. The beforeChange hook below prevents such accounts from ever
    // choosing their own admin flag.
    create: () => true,
    read: ({ req }) => {
      if (isAdmin(req.user as UserWithAdminFlag)) return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    update: ({ req }) => {
      if (isAdmin(req.user as UserWithAdminFlag)) return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    delete: ({ req }) => isAdmin(req.user as UserWithAdminFlag),
  },
  // Default tokenExpiration is 2 hours, which logged mobile users out on
  // every app restart even though the JWT itself is persisted to disk
  // (see mobile/src/api/client.ts's use of @capacitor/preferences). Members
  // expect to stay signed in indefinitely, so issue long-lived tokens instead.
  //
  // useSessions: false is required here. Payload 3.x defaults every auth
  // collection to session-based auth: a real login writes a session record
  // (with a `sid`) onto the user doc, and the JWT must carry a matching
  // `sid` or every request is treated as logged out — see
  // node_modules/payload/dist/auth/strategies/jwt.js. Our mobile app's
  // Google Sign-In flow (src/lib/mobileAuth.ts) signs a plain
  // `{ id, collection, email }` JWT with no session/`sid`, exactly mirroring
  // what Payload's own login endpoint signs — except sessions made that
  // token always fail the `sid` check, regardless of signature or
  // expiration. Disabling sessions restores plain stateless-JWT auth, where
  // `tokenExpiration` alone governs validity for both the built-in
  // email/password login and the custom Google token.
  auth: {
    tokenExpiration: 60 * 60 * 24 * 365, // 1 year
    useSessions: false,
    forgotPassword: {
      // Send the reset link to our user-facing page instead of the Payload
      // admin panel's /admin/reset/:token route, which members wouldn't
      // recognise.
      generateEmailHTML: (args?: { token?: string }) => {
        const token = args?.token
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://2026.lcaustin.org'}/reset-password?token=${token}`
        return `
          <p>Hello,</p>
          <p>You requested a password reset for your LC Austin account.</p>
          <p><a href="${url}">Reset your password</a></p>
          <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
          <p>— Lord's Church of Austin</p>
        `
      },
      generateEmailSubject: () => Promise.resolve('Reset your LC Austin password'),
    },
  },
  hooks: {
    beforeChange: [({ data, operation, req }) => {
      // A user created through the authenticated Payload Admin is an admin.
      // Mobile Google sign-up has no authenticated Payload admin request, so
      // it is always created as a regular member.
      if (operation === 'create') data.isAdmin = isAdmin(req.user as UserWithAdminFlag)
      if (operation === 'update' && !isAdmin(req.user as UserWithAdminFlag)) delete data.isAdmin
      if ('notificationPreferences' in data) data.notificationPreferences = normalizeNotificationPreferences(data.notificationPreferences)
      return data
    }],
  },
  fields: [
    {
      name: 'isAdmin',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Granted automatically to users created from Payload Admin.',
      },
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      // Set when a user signs in via Google so we can find-or-create against
      // the same account on subsequent Google sign-ins. See
      // src/app/(frontend)/api/mobile/google-auth/route.ts.
      name: 'googleId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Google account ID, set automatically on first Google sign-in.',
      },
    },
    {
      name: 'notificationPreferences',
      type: 'json',
      admin: {
        description: 'Notification topic keys for this user, for example ["adult", "youth"]. All of the user’s devices follow this one list.',
      },
      defaultValue: [],
    },
  ],
}
