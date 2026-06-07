import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'

// 설교 (Sermons) — used for "함께 예배드려요" / latest sermon card
export const Sermons: CollectionConfig = {
  slug: 'sermons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'preacher', 'date'],
  },
  access: {
    read: () => true,
  },
  fields: [
    bilingualText('title', { label: 'Sermon Title', koLabel: '제목 (Korean)', enLabel: 'Title (English)' }),
    bilingualText('preacher', {
      label: 'Preacher',
      required: false,
      koLabel: '설교자 (Korean)',
      enLabel: 'Preacher (English)',
    }),
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Video URL',
      admin: { description: 'YouTube / Vimeo link for the sermon recording' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Thumbnail',
    },
  ],
}
