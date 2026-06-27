import type { CollectionConfig } from 'payload'

/**
 * One document per mobile device registration. A user can have multiple
 * devices (phone + tablet); each gets its own FCM/APNs token and topic list.
 * Written by the mobile app via POST /api/mobile/push-token (see
 * src/app/(frontend)/api/mobile/push-token/route.ts), read by the push-send
 * job to know which topics exist for a given user. Topics themselves are
 * managed via FCM topic subscriptions, but we mirror them here so the admin
 * can see who's subscribed to what without calling out to Firebase.
 */
export const DeviceTokens: CollectionConfig = {
  slug: 'device-tokens',
  admin: {
    useAsTitle: 'token',
    defaultColumns: ['user', 'platform', 'topics', 'updatedAt'],
  },
  access: {
    // Only readable/writable through the authenticated mobile API routes
    // (which use the Payload local API, bypassing access control) or admins.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'platform',
      type: 'select',
      options: ['ios', 'android'],
      required: true,
    },
    {
      name: 'topics',
      type: 'text',
      hasMany: true,
      defaultValue: [],
      admin: {
        description: 'Ministry notification topic keys this device is subscribed to.',
      },
    },
  ],
}
