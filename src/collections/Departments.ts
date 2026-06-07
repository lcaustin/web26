import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'

// 다음세대 (Next Generation departments) — tile grid on the landing page
export const Departments: CollectionConfig = {
  slug: 'departments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'icon', 'order'],
    description: '다음세대 department tiles (e.g. 영아부, 유치부, 에노스, …)',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  fields: [
    bilingualText('name', {
      label: 'Department Name',
      koLabel: '부서명 (Korean)',
      enLabel: 'Department Name (English)',
    }),
    bilingualText('description', {
      label: 'Description',
      required: false,
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
