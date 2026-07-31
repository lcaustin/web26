import type { CollectionConfig } from 'payload'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: { useAsTitle: 'nameKo', defaultColumns: ['nameKo', 'nameEn', 'active', 'order'] },
  access: { read: () => true, create: ({ req }) => Boolean(req.user?.isAdmin), update: ({ req }) => Boolean(req.user?.isAdmin), delete: ({ req }) => Boolean(req.user?.isAdmin) },
  fields: [
    { name: 'nameKo', type: 'text', required: true, label: 'Name (한국어)' },
    { name: 'nameEn', type: 'text', required: true, label: 'Name (English)' },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Active' },
  ],
}
