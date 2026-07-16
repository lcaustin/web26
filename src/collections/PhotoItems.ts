import type { CollectionConfig } from 'payload'

export const PhotoItems: CollectionConfig = {
  slug: 'photo-items',
  admin: { useAsTitle: 'legacyId', defaultColumns: ['album', 'sortOrder', 'eventDate'], group: 'Media' },
  access: { read: () => true },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'legacyId', type: 'text', required: true, unique: true, admin: { readOnly: true } },
    { name: 'album', type: 'relationship', relationTo: 'photo-albums', required: true, index: true, label: '앨범' },
    { name: 'imageUrl', type: 'text', required: true, label: '이미지 URL' },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0, label: '정렬 순서' },
    { name: 'eventDate', type: 'date', label: '촬영 날짜' },
  ],
}
