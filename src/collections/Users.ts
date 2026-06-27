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
  auth: true,
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
