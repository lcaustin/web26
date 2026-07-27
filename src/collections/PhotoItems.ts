import type { CollectionConfig } from 'payload'

export const PhotoItems: CollectionConfig = {
  slug: 'photo-items',
  admin: { useAsTitle: 'legacyId', defaultColumns: ['legacyId', 'sortOrder', 'eventDate'], group: 'Media' },
  access: { read: () => true },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'legacyId', type: 'text', required: true, unique: true, admin: { readOnly: true } },
    { name: 'album', type: 'relationship', relationTo: 'photo-albums', required: true, index: true, label: '앨범' },
    { name: 'imageUrl', type: 'text', required: false, label: '이미지 URL (Legacy)' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: '사진 업로드 · Upload Photo',
      admin: { description: 'Upload one image here, or use Media for bulk uploads to R2.' },
    },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0, label: '정렬 순서' },
    { name: 'eventDate', type: 'date', label: '촬영 날짜' },
  ],
}
