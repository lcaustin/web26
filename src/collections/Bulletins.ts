import type { CollectionConfig } from 'payload'
import { syncBulletinNews } from '../lib/bulletin-news.ts'

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
    afterChange: [
      async ({ doc, operation, req }) => {
        // A bulletin is parsed once on upload. Its extracted News records are
        // linked back to this document, so they never duplicate manual/home-page news.
        if (operation === 'create') await syncBulletinNews(req.payload, doc)
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const { docs } = await req.payload.find({ collection: 'news', limit: 100, where: { sourceBulletin: { equals: doc.id } } })
        await Promise.all(docs.map((item: any) => req.payload.delete({ collection: 'news', id: item.id })))
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
    // Payload's S3 storage adapter stores the object prefix here. Historic
    // bulletins use `uploads/file` rather than the new `bulletins` prefix, so
    // this must remain part of the schema rather than being auto-removed.
    {
      name: 'prefix',
      type: 'text',
      admin: { hidden: true },
    },
  ],
  upload: {
    // Disabled automatically by the S3 adapter when the R2 environment
    // variables are set; retained for local development without R2 access.
    staticDir: '../media/bulletins',
    mimeTypes: ['application/pdf'],
  },
}
