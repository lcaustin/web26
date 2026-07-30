import type { CollectionConfig } from 'payload'

type UserWithAdminFlag = { isAdmin?: boolean } | null | undefined
const isAdmin = (user: UserWithAdminFlag) => user?.isAdmin === true

export const BibleStudySignups: CollectionConfig = {
  slug: 'bible-study-signups',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['name', 'phone', 'email', 'bibleStudy'],
    description: 'Registrations for seasonal Bible studies',
    pagination: { defaultLimit: 100 },
    components: {
      beforeList: ['/components/admin/BibleStudySignupExportButton#default'],
    },
  },
  defaultSort: '-bibleStudy.targetGroup.ko,createdAt',
  access: {
    // Admins can read all; logged-in users can read their own signups.
    read: ({ req }) => {
      if (isAdmin(req.user as UserWithAdminFlag)) return true
      return req.user ? { user: { equals: req.user.id } } : false
    },
    // Creation is handled by the Next.js API route using the Local API,
    // but we can allow creating directly if logged in, or keep it admin-only.
    // Let's restrict direct REST access to admins/users themselves.
    create: ({ req }) => {
      if (isAdmin(req.user as UserWithAdminFlag)) return true
      return Boolean(req.user)
    },
    update: ({ req }) => {
      if (isAdmin(req.user as UserWithAdminFlag)) return true
      return req.user ? { user: { equals: req.user.id } } : false
    },
    delete: ({ req }) => isAdmin(req.user as UserWithAdminFlag),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data) {
          data.adminTitle = `${data.name || 'Anonymous'} - Bible Study Signup`
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
      name: 'bibleStudy',
      type: 'relationship',
      relationTo: 'bible-studies',
      required: false,
      index: true,
    },
    {
      name: 'semesterRef',
      type: 'relationship',
      relationTo: 'bible-study-semesters',
      label: 'Managed Semester · 학기',
      admin: { description: 'Semester selected for the related group.' },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'text',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: {
        description: 'Optional link to a registered user account',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes / Special Requests',
    },
  ],
}
