import type { CollectionConfig } from 'payload'

export const PhotoAlbums: CollectionConfig = {
  slug: 'photo-albums',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'eventDate', 'imageCount', 'updatedAt'], group: 'Media' },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true, label: '앨범 제목' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: 'legacyKey', type: 'text', unique: true, admin: { readOnly: true } },
    { name: 'description', type: 'textarea', label: '설명' },
    { name: 'tags', type: 'text', label: '태그' },
    { name: 'eventDate', type: 'date', label: '행사 날짜' },
    { name: 'coverImageUrl', type: 'text', label: '대표 이미지 URL (Legacy)' },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: '대표 이미지 업로드 · Upload Cover',
      admin: { description: 'Upload a cover image to R2, or choose one from Media.' },
    },
    { name: 'imageCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
  ],
}
