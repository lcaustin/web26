// The 7 ministry notification topic keys. Must stay in sync with:
// - the `notificationPreferences` array on src/collections/Users.ts
// - mobile/src/config.ts NOTIFICATION_CATEGORIES
export const NOTIFICATION_TOPICS = [
  'adult',
  'youth',
  'elementary',
  'collegeYoungAdult',
  'preschool',
  'nursery',
  'englishMinistry',
] as const

export type NotificationTopic = (typeof NOTIFICATION_TOPICS)[number]
