import type { CollectionConfig } from 'payload'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: { useAsTitle: 'nameKo', defaultColumns: ['roomNumber', 'nameKo', 'nameEn', 'active', 'reservable', 'order'] },
  defaultSort: 'roomNumber',
  access: { read: () => true, create: ({ req }) => Boolean(req.user?.isAdmin), update: ({ req }) => Boolean(req.user?.isAdmin), delete: ({ req }) => Boolean(req.user?.isAdmin) },
  fields: [
    { name: 'roomNumber', type: 'number', required: true, unique: true, label: 'Room Number · 호실 번호', admin: { description: 'Unique numeric room number from the building directory.' } },
    { name: 'nameKo', type: 'text', required: true, label: 'Name (한국어)' },
    { name: 'nameEn', type: 'text', required: true, label: 'Name (English)' },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'active', type: 'checkbox', defaultValue: true, label: 'Active' },
    { name: 'reservable', type: 'checkbox', defaultValue: true, label: 'Reservable · 예약 가능', admin: { description: 'When disabled, this room is hidden from the public booking form.' } },
  ],
}
