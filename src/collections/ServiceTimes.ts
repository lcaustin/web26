import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'

// 예배시간 안내 (Service Times)
export const ServiceTimes: CollectionConfig = {
  slug: 'service-times',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'time', 'order'],
    description: 'Worship service schedule shown on the /service-times page',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  fields: [
    bilingualText('name', {
      label: 'Service Name',
      koLabel: '예배명 (Korean)',
      enLabel: 'Service Name (English)',
    }),
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
