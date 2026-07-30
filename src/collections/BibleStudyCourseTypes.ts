import type { CollectionConfig } from 'payload'
import { bilingualText } from '../fields/bilingual.ts'

export const BibleStudyCourseTypes: CollectionConfig = {
  slug: 'bible-study-course-types',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['name', 'slug', 'order'],
    description: 'Manage Bible Study course types shown in the registration page.',
  },
  access: { read: () => true },
  defaultSort: 'order,name',
  hooks: {
    beforeChange: [({ data }) => {
      if (data) data.adminTitle = `${data.name?.ko || data.name?.en || ''} (${data.slug || ''})`
      return data
    }],
  },
  fields: [
    { name: 'adminTitle', type: 'text', admin: { hidden: true } },
    bilingualText('name', { label: 'Course Type Name', required: true, enRequired: false }),
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug (e.g. coffee-break)' },
    { name: 'order', type: 'number', defaultValue: 0, label: 'Display Order' },
  ],
}
