import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'

// 예배시간 안내 (Service Times)
export const ServiceTimes: CollectionConfig = {
  slug: 'service-times',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'group', 'time', 'order'],
    description: 'Worship service schedule shown on the /service-times page',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data) data.adminTitle = data?.name?.ko || data?.name?.en || 'Service time'
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
    bilingualText('name', {
      label: 'Service Name',
      koLabel: '예배명 (Korean)',
      enLabel: 'Service Name (English)',
    }),
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'sunday-worship',
      options: [
        { label: 'Sunday Worship', value: 'sunday-worship' },
        { label: 'Weekday Worship & Prayer', value: 'weekday-worship' },
        { label: 'Next Generation', value: 'next-generation' },
      ],
    },
    {
      name: 'time',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "주일 오전 11:00" / "Sunday 11:00 AM"' },
    },
    {
      name: 'location',
      type: 'text',
      admin: { description: 'Optional — room / building name' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower numbers appear first' },
    },
  ],
}
