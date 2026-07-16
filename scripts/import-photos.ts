/**
 * Imports LC/data/photos.json. Safe to rerun: albums and images are upserted
 * by their legacy title and Mongo ID.
 *
 * Usage: pnpm tsx scripts/import-photos.ts
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

type Photo = { _id: { $oid: string }, title: string, img_path: string, tags?: string | null, description?: string | null, created_at?: { $date?: string }, updated_at?: { $date?: string } }

const envDatabaseUri = ['.env.local', '.env']
  .map((name) => path.resolve(process.cwd(), name))
  .filter(existsSync)
  .map((file) => readFileSync(file, 'utf8').match(/^\s*DATABASE_URI\s*=\s*['\"]?([^'\"\r\n]+)['\"]?\s*$/m)?.[1])
  .find((value): value is string => Boolean(value))
const databaseUri = process.env.DATABASE_URI || envDatabaseUri
if (!databaseUri) throw new Error('DATABASE_URI is required. Load your .env.local before running this script.')
const connectionString: string = databaseUri
const photos = JSON.parse(readFileSync(path.resolve(process.cwd(), '../data/photos.json'), 'utf8')) as Photo[]
const hash = (value: string) => createHash('sha1').update(value).digest('hex').slice(0, 12)
const r2Path = (value: string) => '/' + value.replace(/^\/+/, '')
const photoDate = (photo: Photo) => photo.created_at?.$date || photo.updated_at?.$date || null

async function main() {
  const client = new Client({ connectionString })
  await client.connect()
  try {
    const albums = new Map<string, Photo[]>()
    for (const photo of photos) albums.set(photo.title, [...(albums.get(photo.title) ?? []), photo])
    let count = 0
    for (const [title, sourceItems] of albums) {
      const items = [...sourceItems].sort((a, b) => {
        const aDate = Date.parse(photoDate(a) ?? '') || 0
        const bDate = Date.parse(photoDate(b) ?? '') || 0
        return bDate - aDate
      })
      const first = items[0]
      const newestDate = photoDate(first)
      const result: any = await client.query('INSERT INTO photo_albums (title, slug, legacy_key, description, tags, event_date, cover_image_url, image_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (legacy_key) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, tags=EXCLUDED.tags, event_date=EXCLUDED.event_date, cover_image_url=EXCLUDED.cover_image_url, image_count=EXCLUDED.image_count, updated_at=now() RETURNING id', [title, 'album-' + hash(title), title, first.description ?? null, first.tags ?? null, newestDate, r2Path(first.img_path), items.length])
      const albumId = result.rows[0].id as number
      for (const [sortOrder, photo] of items.entries()) {
        await client.query('INSERT INTO photo_items (legacy_id, album_id, image_url, sort_order, event_date, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,COALESCE($6::timestamptz,now()),COALESCE($7::timestamptz,now())) ON CONFLICT (legacy_id) DO UPDATE SET album_id=EXCLUDED.album_id, image_url=EXCLUDED.image_url, sort_order=EXCLUDED.sort_order, event_date=EXCLUDED.event_date, updated_at=EXCLUDED.updated_at', [photo._id.$oid, albumId, r2Path(photo.img_path), sortOrder, photoDate(photo), photo.created_at?.$date ?? null, photo.updated_at?.$date ?? null])
        count += 1
      }
    }
    console.log('Imported or updated ' + albums.size + ' albums and ' + count + ' photos.')
  } finally {
    await client.end()
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
