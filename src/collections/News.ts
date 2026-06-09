import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'
import { bilingualRichText } from '../fields/richText.ts'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// 소식 (News / Announcements) — shown as mini-cards on the landing page
export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'date', 'slug', 'updatedAt'],
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
        if (data) {
          data.adminTitle = data?.title?.ko || data?.title?.en || ''
          // Auto-generate slug from English title + date if not manually set
          if (!data.slug) {
            const base = data?.title?.en || data?.title?.ko || ''
            const datePart = data?.date ? new Date(data.date).getFullYear() : ''
            data.slug = toSlug(`${base}${datePart ? '-' + datePart : ''}`)
          }
        }
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
    {
      name: 'slug',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier, auto-generated from English title. Edit only if needed.',
        position: 'sidebar',
      },
    },
    bilingualText('title', { label: 'Title', koLabel: '제목 (Korean)', enLabel: 'Title (English)' }),
    bilingualRichText('content', {
      label: 'Content',
      koLabel: '내용 (Korean)',
      enLabel: 'Content (English)',
    }),
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
    {
      name: 'eventDates',
      type: 'group',
      label: 'Special Event Dates (optional)',
      admin: {
        description:
          'Set both dates to feature this item in the Special Event carousel on the home page. Leave blank for regular announcements.',
      },
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: 'Event Start Date',
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Event End Date',
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
  ],
}
