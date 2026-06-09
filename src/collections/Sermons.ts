import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'
import { bilingualRichText } from '../fields/richText.ts'

// 설교 (Sermons) — used for "함께 예배드려요" / latest sermon card
export const Sermons: CollectionConfig = {
  slug: 'sermons',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'preacher', 'date'],
  },
  access: {
    read: () => true,
  },
  // The `title` field below is a bilingual { ko, en } group, so it can't be used
  // directly as `useAsTitle` (Payload's admin UI needs a plain string). This
  // hidden field mirrors the Korean title for display in lists/breadcrumbs.
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data) data.adminTitle = data?.title?.ko || data?.title?.en || ''
        return data
      },
    ],
  },
  fields: [
    {
      name: 'adminTitle',
      type: 'text',
      admin: { hidden: true },
    },
    bilingualText('title', { label: 'Sermon Title', koLabel: '제목 (Korean)', enLabel: 'Title (English)' }),
    bilingualText('preacher', {
      label: 'Preacher',
      required: false,
      koLabel: '설교자 (Korean)',
      enLabel: 'Preacher (English)',
    }),
    bilingualRichText('notes', {
      label: 'Sermon Notes',
      koLabel: '설교 노트 (Korean)',
      enLabel: 'Sermon Notes (English)',
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
