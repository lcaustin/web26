import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
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
import { Bulletins } from './collections/Bulletins.ts'
import { Pages } from './collections/Pages.ts'
import { DeviceTokens } from './collections/DeviceTokens.ts'
import { SiteSettings } from './globals/SiteSettings.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://2026.lcaustin.org'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')
const hasR2Storage = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_ENDPOINT &&
    R2_PUBLIC_URL,
)

export default buildConfig({
  serverURL: SERVER_URL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // Google Workspace SMTP — set these four env vars in Vercel:
  //   EMAIL_FROM        e.g. "LC Austin <noreply@lcaustin.org>"
  //   EMAIL_USER        your Gmail/Workspace address
  //   EMAIL_PASSWORD    an App Password (Google Account → Security → App passwords)
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM || 'noreply@lcaustin.org',
    defaultFromName: 'LC Austin',
    transportOptions: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
  }),
  // Once either array is non-empty Payload treats it as a strict allowlist,
  // so every legitimate origin must be listed — both the production site (for
  // the Payload admin panel's cookie-auth CSRF check) and the Capacitor mobile
  // app's WebView origins (for native fetch() calls from Android/iOS).
  cors: [
    'https://2026.lcaustin.org', // production site + admin panel
    'https://lcaustin.org', // production site + admin panel
    'https://localhost',         // Capacitor Android (default androidScheme=https)
    'capacitor://localhost',     // Capacitor iOS
    'http://localhost',          // local dev
  ],
  csrf: [
    'https://2026.lcaustin.org', // admin panel — must be here or cookie auth is rejected
    'https://localhost',
    'capacitor://localhost',
    'http://localhost',
  ],
  collections: [
    Users,
    Media,
    Pages,
    News,
    Sermons,
    Bulletins,
    ServiceTimes,
    Departments,
    QuickLinks,
    DeviceTokens,
  ],
  globals: [SiteSettings],
  // Cloudflare R2 is S3-compatible. Keep this conditional so local development
  // can continue using the local upload directory without cloud credentials.
  plugins: [
    s3Storage({
      enabled: hasR2Storage,
      collections: {
        bulletins: {
          prefix: 'bulletins',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            const key = prefix ? `${prefix}/${filename}` : filename
            return `${R2_PUBLIC_URL}/${key}`
          },
        },
      },
      bucket: process.env.R2_BUCKET!,
      clientUploads: true,
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: true,
      },
    }),
  ],
  editor: lexicalEditor(),
  // Falling back to '' when PAYLOAD_SECRET is unset used to fail silently:
  // any request handled by a runtime where the env var didn't resolve would
  // sign/verify JWTs with an empty string instead of the real secret, so a
  // token issued by one invocation could be silently rejected by another —
  // producing exactly the "valid token immediately treated as logged out"
  // symptom mobile users hit. Throw loudly instead so a misconfigured
  // environment fails the deploy/boot, not individual users' sessions.
  secret: (() => {
    if (!process.env.PAYLOAD_SECRET) {
      throw new Error('PAYLOAD_SECRET environment variable is not set')
    }
    return process.env.PAYLOAD_SECRET
  })(),
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
