import type { CollectionConfig } from 'payload'

// The 7 ministry notification categories surfaced in the mobile app's settings
// menu. `name` here must match `NOTIFICATION_CATEGORIES[].key` in
// mobile/src/config.ts and the FCM topic name used in
// src/app/(frontend)/api/mobile/send-notification/route.ts.
const notificationCategoryFields = [
  { name: 'adult', label: '장년부 / Adult' },
  { name: 'youth', label: '중고등부 / Youth' },
  { name: 'elementary', label: '초등부 / Elementary' },
  { name: 'collegeYoungAdult', label: '대학청년부 / College-Young Adult' },
  { name: 'preschool', label: '유아부 / Preschool' },
  { name: 'nursery', label: '영아부 / Nursery' },
  { name: 'englishMinistry', label: 'English Ministry' },
] as const

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
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
  fields: [
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
      type: 'group',
      admin: {
        description: 'Which ministry announcements this user wants push notifications for.',
      },
      fields: notificationCategoryFields.map((cat) => ({
        name: cat.name,
        type: 'checkbox' as const,
        defaultValue: false,
        label: cat.label,
      })),
    },
  ],
}
