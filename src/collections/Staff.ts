import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'

// Staff directory for the Church Guide → Our Staff page.
export const Staff: CollectionConfig = {
  slug: 'staff',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'group', 'role', 'order'],
    description: 'Church staff directory shown on the /staff page',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order,legacyIndex',
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data) data.adminTitle = data.name?.ko || data.name?.en || 'Staff member'
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
      name: 'legacyId',
      type: 'text',
      unique: true,
      admin: { hidden: true },
    },
    {
      name: 'legacyIndex',
      type: 'number',
      admin: { hidden: true },
    },
    bilingualText('name', {
      label: 'Name',
      required: false,
      koLabel: '성함 (Korean)',
      enLabel: 'Name (English)',
    }),
    bilingualText('role', {
      label: 'Role',
      required: false,
      koLabel: '직책 (Korean)',
      enLabel: 'Role (English)',
    }),
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'pastoral',
      options: [
        { label: 'Pastoral Staff', value: 'pastoral' },
        { label: 'Ministry Staff', value: 'ministry' },
        { label: 'Church Leaders', value: 'church-leaders' },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional portrait photo' },
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: { description: 'Legacy R2 portrait URL. A newly uploaded Photo takes precedence.' },
    },
    {
      name: 'backImageUrl',
      type: 'text',
      admin: { description: 'Legacy R2 back portrait URL shown when the portrait is hovered or tapped.' },
    },
    bilingualText('status', {
      label: 'Ministry / Status',
      required: false,
      koLabel: '사역 / 상태 (Korean)',
      enLabel: 'Ministry / Status (English)',
    }),
    {
      name: 'email',
      type: 'email',
      admin: { description: 'Optional public contact address' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower numbers appear first within each group' },
    },
  ],
}
