import type { CollectionConfig } from 'payload'

/**
 * Weekly church bulletins. Each document is the uploaded PDF itself, with an
 * issue date used to build the public newest-first archive at /bulletin.
 */
export const Bulletins: CollectionConfig = {
  slug: 'bulletins',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'issueDate', 'updatedAt'],
    description: 'Upload the weekly bulletin PDF and choose the Sunday it was issued.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.issueDate) {
          data.adminTitle = `${String(data.issueDate).slice(0, 10)} 주보`
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
      name: 'issueDate',
      type: 'date',
      required: true,
      label: 'Bulletin Date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'The Sunday date displayed in the bulletin archive.',
      },
    },
  ],
  upload: {
    // Disabled automatically by the S3 adapter when the R2 environment
    // variables are set; retained for local development without R2 access.
    staticDir: '../media/bulletins',
    mimeTypes: ['application/pdf'],
  },
}
