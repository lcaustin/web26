import type { CollectionConfig } from 'payload'

export const BibleStudySemesters: CollectionConfig = {
  slug: 'bible-study-semesters',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'active'],
    description: 'Create and manage semester options used by Bible Study groups.',
    components: {
      beforeList: [
        '/components/admin/DuplicateSemesterButton#default',
      ],
      edit: {
        beforeDocumentControls: ['/components/admin/BibleStudyOrderControl#default'],
      },
    },
  },
  access: { read: () => true },
  defaultSort: 'name',
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await req.payload.update({
          collection: 'bible-studies',
          where: { semesterRef: { equals: doc.id } },
          data: { status: doc.status },
        })
        return doc
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, label: 'Semester · 학기 (e.g. 2026 Fall)' },
    {
      name: 'status', type: 'select', required: true, defaultValue: 'before', label: 'Status · 모집 상태',
      options: [
        { label: '모집 준비중 · Before Open', value: 'before' },
        { label: '모집중 · Open', value: 'open' },
        { label: '마감 · Closed', value: 'closed' },
      ],
      admin: { description: 'Changing this updates all Bible Study groups assigned to this semester.' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active · 홈페이지 표시',
      admin: { description: 'Inactive semesters and their groups are hidden from the public Bible Studies page.' },
    },
  ],
}
