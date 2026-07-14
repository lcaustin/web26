/**
 * Imports the legacy Mongo staff directory from ../data/staffs.json.
 * Portraits are already in R2 under /staff, so this stores their public URLs
 * without duplicating files or creating media records.
 *
 * Usage: pnpm tsx scripts/import-staff.ts
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

type LegacyStaff = {
  _id?: { $oid?: string }
  name?: string
  role?: string
  status?: string
  order?: number
  old?: { back?: string, image?: string }
  created_at?: { $date?: string } | null
  updated_at?: { $date?: string } | null
}

const env = Object.fromEntries(
  ['.env', '.env.local'].flatMap((name) => {
    const file = path.resolve(process.cwd(), name)
    if (!existsSync(file)) return []
    return readFileSync(file, 'utf8').split(/\r?\n/)
      .map((line) => line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1].trim(), match[2].replace(/^['"]|['"]$/g, '')])
  }),
)
const databaseUri = process.env.DATABASE_URI || env.DATABASE_URI
if (!databaseUri) throw new Error('DATABASE_URI is missing from the environment and .env.local')

const r2PublicUrl = (process.env.R2_PUBLIC_URL || env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')
const staff = JSON.parse(readFileSync(path.resolve(process.cwd(), '../data/staffs.json'), 'utf8')) as LegacyStaff[]

function groupFor(member: LegacyStaff) {
  if (member.role === '목사' || member.role === '전도사') return 'pastoral'
  if (member.role === '간사' || member.role === '지휘자') return 'ministry'
  return 'church-leaders'
}

function legacyImageUrl(imagePath?: string) {
  const image = imagePath?.replace(/^\//, '')
  return image ? `${r2PublicUrl}/${image.split('/').map(encodeURIComponent).join('/')}` : null
}

async function main() {
  const client = new Client({ connectionString: databaseUri })
  await client.connect()
  try {
    for (const [legacyIndex, member] of staff.entries()) {
      if (!member.name) continue
      const sourceId = member._id?.$oid
      if (!sourceId) continue
      await client.query(
        `INSERT INTO staff (legacy_id, legacy_index, admin_title, name_ko, role_ko, status_ko, "group", image_url, back_image_url, "order", created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::enum_staff_group, $8, $9, $10, COALESCE($11::timestamptz, now()), COALESCE($12::timestamptz, now()))
         ON CONFLICT (legacy_id) DO UPDATE SET
           name_ko = EXCLUDED.name_ko, role_ko = EXCLUDED.role_ko, status_ko = EXCLUDED.status_ko,
           legacy_index = EXCLUDED.legacy_index, "group" = EXCLUDED."group", image_url = EXCLUDED.image_url, back_image_url = EXCLUDED.back_image_url, "order" = EXCLUDED."order", updated_at = EXCLUDED.updated_at`,
        [sourceId, legacyIndex, member.name, member.name, member.role || null, member.status || null, groupFor(member), legacyImageUrl(member.old?.image), legacyImageUrl(member.old?.back), member.order || 0, member.created_at?.$date || null, member.updated_at?.$date || null],
      )
    }
    const result = await client.query('SELECT "group", COUNT(*)::int AS count FROM staff GROUP BY "group" ORDER BY "group"') as { rows: { group: string; count: number }[] }
    console.table(result.rows)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
