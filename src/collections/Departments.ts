import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'
import { bilingualRichText } from '../fields/richText.ts'

// 다음세대 (Next Generation departments) — tile grid on the landing page
export const Departments: CollectionConfig = {
  slug: 'departments',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'icon', 'order'],
    description: '다음세대 department tiles (e.g. 영아부, 유치부, 에노스, …)',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  // The `name` field below is a bilingual { ko, en } group, so it can't be used
  // directly as `useAsTitle` (Payload's admin UI needs a plain string). This
  // hidden field mirrors the Korean title for display in lists/breadcrumbs.
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data) data.adminTitle = data?.name?.ko || data?.name?.en || ''
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
      label: 'Department Name',
      koLabel: '부서명 (Korean)',
      enLabel: 'Department Name (English)',
    }),
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        description:
          'URL-friendly identifier used for this department\'s page, e.g. "nursery" → /departments/nursery',
      },
    },
    bilingualRichText('description', {
      label: 'Description',
      koLabel: '설명 (Korean)',
      enLabel: 'Description (English)',
    }),
    {
      name: 'icon',
      type: 'text',
      required: true,
      admin: { description: 'Tabler Icons class name, e.g. "ti-user-circle"' },
    },
    {
      name: 'href',
      type: 'text',
      label: 'Link (optional)',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower numbers appear first' },
    },
  ],
}
