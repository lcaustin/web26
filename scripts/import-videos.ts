/**
 * Imports the legacy Mongo export at ../data/videos.json into the unified
 * Payload video archive. It is safe to run repeatedly: source + video ID is
 * unique and each execution updates the same row.
 *
 * Usage: pnpm tsx scripts/import-videos.ts
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

type LegacyVideo = {
  category?: string
  created_at?: { $date?: string }
  updated_at?: { $date?: string }
  description?: string
  img_large?: string
  img_small?: string
  source?: 'youtube' | 'vimeo'
  tags?: string
  title?: string
  video_id: string
}

const env = Object.fromEntries(
  ['.env', '.env.local'].flatMap((name) => {
    const envFile = path.resolve(process.cwd(), name)
    if (!existsSync(envFile)) return []
    return readFileSync(envFile, 'utf8')
      .split(/\r?\n/)
      .map((line) => {
        const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/)
        return match ? [match[1].trim(), match[2].replace(/^['"]|['"]$/g, '')] : []
      })
      .filter((entry) => entry.length === 2)
  }),
)
const databaseUri = process.env.DATABASE_URI || env.DATABASE_URI
if (!databaseUri) throw new Error('DATABASE_URI is missing from the environment and .env.local')

const rows = JSON.parse(readFileSync(path.resolve(process.cwd(), '../data/videos.json'), 'utf8')) as LegacyVideo[]

function contentType(video: LegacyVideo) {
  const category = video.category || ''
  const text = `${video.tags || ''} ${video.title || ''} ${video.description || ''}`
  if (category === '매일말씀묵상' || text.includes('daily')) return 'daily-devotion'
  if (category === '성가대' || text.includes('찬양대')) return 'choir'
  if (category === '특송' || text.includes('헌금송') || text.includes('특송')) return 'special-music'
  if (text.includes('주일설교')) return 'sermon'
  if (text.includes('예배실황') || text.includes('금요예배') || text.includes('경배와찬양')) return 'worship'
  if (text.includes('교육부') || text.includes('영아부') || text.includes('유아부') || text.includes('초등부') || text.includes('중고등부') || text.includes('대학부') || text.includes('청년부')) return 'ministry'
  if (category === '설교') return 'sermon'
  return 'other'
}

function publishedAt(video: LegacyVideo) {
  const match = video.title?.match(/^(20\d{2})[-./](\d{2})[-./](\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}T12:00:00.000Z` : video.created_at?.$date || new Date(0).toISOString()
}

function videoUrl(video: LegacyVideo) {
  return video.source === 'vimeo'
    ? `https://vimeo.com/${video.video_id}`
    : `https://www.youtube.com/watch?v=${video.video_id}`
}

async function main() {
  const client = new Client({ connectionString: databaseUri })
  await client.connect()

  try {
    let imported = 0
    // A few records in the Mongo export repeat the same provider/video ID.
    // Keep the last copy so a single PostgreSQL upsert never targets one row twice.
    const importable = [...new Map(
      rows
        .filter((video) => video.video_id && video.source)
        .map((video) => [`${video.source}:${video.video_id}`, video]),
    ).values()]
    for (let start = 0; start < importable.length; start += 200) {
      const batch = importable.slice(start, start + 200)
      const values = batch.flatMap((video) => [
        video.title || 'Untitled video', contentType(video), video.source, video.video_id, videoUrl(video),
        video.img_large || video.img_small || null, video.description || null, video.tags || null,
        publishedAt(video), video.created_at?.$date || null, video.updated_at?.$date || null,
      ])
      const placeholders = batch.map((_, row) => {
        const offset = row * 11
        return `(${Array.from({ length: 9 }, (_, column) => `$${offset + column + 1}`).join(', ')}, COALESCE($${offset + 10}::timestamptz, now()), COALESCE($${offset + 11}::timestamptz, now()))`
      }).join(', ')
      await client.query(
       `INSERT INTO videos (admin_title, category, source, video_id, video_url, thumbnail_url, description, tags, published_at, created_at, updated_at)
       VALUES ${placeholders}
       ON CONFLICT (source, video_id) DO UPDATE SET
         admin_title = EXCLUDED.admin_title, category = EXCLUDED.category, video_url = EXCLUDED.video_url,
         thumbnail_url = EXCLUDED.thumbnail_url, description = EXCLUDED.description, tags = EXCLUDED.tags,
         published_at = EXCLUDED.published_at, updated_at = EXCLUDED.updated_at`,
      values,
      )
      imported += batch.length
    }
    console.log(`Imported or updated ${imported} videos.`)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
