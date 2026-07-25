import type { CollectionConfig } from 'payload'

/**
 * One document per mobile device registration. A user can have multiple
 * devices (phone + tablet); each gets its own FCM/APNs token. Notification
 * preferences live on the user record, so every device follows the same topic
 * list when the mobile API reconciles its FCM subscriptions.
 */
export const DeviceTokens: CollectionConfig = {
  slug: 'device-tokens',
  admin: {
    useAsTitle: 'token',
    defaultColumns: ['user', 'platform', 'updatedAt'],
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
  ],
}
