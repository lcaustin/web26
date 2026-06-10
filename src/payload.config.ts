import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

// NOTE: relative imports (not the `@/*` alias) are used here deliberately —
// this config file is loaded directly by the Payload CLI / Node's ESM loader
// (e.g. `payload generate:importmap`, `payload generate:types`), which does
// not resolve the `@/*` path alias the way Next.js's bundler does.
import { Users } from './collections/Users.ts'
import { Media } from './collections/Media.ts'
import { News } from './collections/News.ts'
import { Sermons } from './collections/Sermons.ts'
import { ServiceTimes } from './collections/ServiceTimes.ts'
import { Departments } from './collections/Departments.ts'
import { QuickLinks } from './collections/QuickLinks.ts'
import { Pages } from './collections/Pages.ts'
import { SiteSettings } from './globals/SiteSettings.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, News, Sermons, ServiceTimes, Departments, QuickLinks],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
})
