import type { CollectionConfig } from 'payload'

export const BibleStudySemesters: CollectionConfig = {
  slug: 'bible-study-semesters',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order'],
    description: 'Create and manage semester options used by Bible Study groups.',
    components: {
      beforeList: ['/components/admin/DuplicateSemesterButton#default'],
    },
  },
  access: { read: () => true },
  defaultSort: 'order,name',
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, label: 'Semester · 학기 (e.g. 2026 Fall)' },
    { name: 'order', type: 'number', defaultValue: 0, label: 'Order' },
  ],
}
