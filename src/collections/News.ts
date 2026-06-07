import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'

// 소식 (News / Announcements) — shown as mini-cards on the landing page
export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    bilingualText('title', { label: 'Title', koLabel: '제목 (Korean)', enLabel: 'Title (English)' }),
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Date shown on the news card (e.g. announcement date)',
      },
    },
    {
      name: 'link',
      type: 'text',
      label: 'Link (optional)',
      admin: { description: 'Optional URL — if set, the card becomes clickable' },
    },
  ],
}
