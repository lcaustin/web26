/**
 * Processes photos from a locally synced Google Drive folder.
 *
 * Flow for each supported file under $PHOTO_BATCH_ROOT/UPLOAD:
 *   1. resize it to a web-friendly WebP file in RESIZED (preserving subfolders)
 *   2. upload that file to R2 through rclone
 *   3. upsert its album and photo item in Payload's PostgreSQL database
 *   4. move the untouched original to RAW (preserving subfolders)
 *
 * An original is never moved unless its resized copy has been uploaded to R2.
 * The script intentionally fails on a same-name destination collision so a
 * photographer's existing file is never replaced without review.
 *
 * Required environment variables:
 *   PHOTO_BATCH_ROOT=/mnt/c/Users/<windows-user>/Google Drive/Church Photos
 *   R2_PHOTO_REMOTE=r2:lcaustin-assets/uploads/photos
 *   DATABASE_URI=postgresql://...
 *
 * Optional:
 *   PHOTO_MAX_WIDTH=1920       (default: 1920)
 *   PHOTO_WEBP_QUALITY=84      (default: 84)
 *   PHOTO_MIN_BYTES=1024       (default: 1024; ignore partially synced files)
 *   PHOTO_DRY_RUN=true         (preview without changing anything)
 *
 * Usage:
 *   pnpm sync:drive-photos
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  renameSync,
  readFileSync,
  rmSync,
  statSync,
  unlinkSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Client } from 'pg'
import sharp from 'sharp'

const supportedExtensions = new Set(['.avif', '.heic', '.heif', '.jpeg', '.jpg', '.png', '.tif', '.tiff', '.webp'])
const root = process.env.PHOTO_BATCH_ROOT
const r2Remote = process.env.R2_PHOTO_REMOTE?.replace(/\/$/, '')
const databaseUri = process.env.DATABASE_URI || databaseUriFromEnvFile()
const maxWidth = positiveNumber('PHOTO_MAX_WIDTH', 1920)
const quality = positiveNumber('PHOTO_WEBP_QUALITY', 84)
const minBytes = positiveNumber('PHOTO_MIN_BYTES', 1024)
const dryRun = process.env.PHOTO_DRY_RUN === 'true'

if (!root) throw new Error('PHOTO_BATCH_ROOT is required.')
if (!r2Remote) throw new Error('R2_PHOTO_REMOTE is required (example: r2:lcaustin-assets/uploads/photos).')
if (!dryRun && !databaseUri) throw new Error('DATABASE_URI is required to create photo records.')

const batchRoot = path.resolve(root)
const uploadRoot = path.join(batchRoot, 'UPLOAD')
const resizedRoot = path.join(batchRoot, 'RESIZED')
const rawRoot = path.join(batchRoot, 'RAW')

function positiveNumber(name: string, defaultValue: number) {
  const value = process.env[name]
  if (!value) return defaultValue
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${name} must be a positive number.`)
  return parsed
}

function databaseUriFromEnvFile() {
  for (const name of ['.env.local', '.env']) {
    const file = path.resolve(process.cwd(), name)
    if (!existsSync(file)) continue
    const match = readFileSync(file, 'utf8').match(/^\s*DATABASE_URI\s*=\s*['\"]?([^'\"\r\n]+)['\"]?\s*$/m)
    if (match?.[1]) return match[1]
  }
  return undefined
}

function hash(value: string) {
  return createHash('sha1').update(value).digest('hex').slice(0, 16)
}

function objectPath(relativeOutput: string) {
  const prefix = r2Remote!.match(/^[^:]+:[^/]+\/(.+)$/)?.[1]
  if (!prefix) throw new Error('R2_PHOTO_REMOTE must include the bucket and object prefix (example: r2:lcaustin-assets/uploads/photos).')
  return `${prefix}/${relativeOutput.split(path.sep).join('/')}`
}

function walk(directory: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(fullPath))
    else if (entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath)
  }
  return files
}

function assertNoCollision(target: string, kind: string) {
  if (existsSync(target)) throw new Error(`${kind} already exists: ${target}`)
}

function runRclone(localFile: string, remoteFile: string) {
  const result = spawnSync('rclone', ['copyto', '--checksum', localFile, remoteFile], { encoding: 'utf8' })
  if (result.error) {
    if ((result.error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('rclone was not found. Install and configure rclone in WSL before running this batch.')
    }
    throw result.error
  }
  if (result.status !== 0) throw new Error(`R2 upload failed: ${result.stderr || result.stdout}`.trim())
}

function moveOriginal(source: string, destination: string) {
  mkdirSync(path.dirname(destination), { recursive: true })
  try {
    renameSync(source, destination)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EXDEV') throw error
    copyFileSync(source, destination)
    unlinkSync(source)
  }
}

type PhotoLocation = {
  category: string
  year: number
  albumKey: string
  albumTitle: string
  itemKey: string
  relativeOutput: string
}

function photoLocation(relativeSource: string): PhotoLocation {
  const parts = relativeSource.split(path.sep)
  const filename = parts.pop()
  const category = parts.shift()
  const yearFolder = parts.shift()
  if (!filename || !category || !yearFolder || !/^\d{4}$/.test(yearFolder)) {
    throw new Error(`Place photos in UPLOAD/<category>/<year>/<album>/... (for example, UPLOAD/교육부/2026/VBS/image.jpg): ${relativeSource}`)
  }
  const relativeOutput = path.join(category, yearFolder, ...parts, `${path.basename(filename, path.extname(filename))}.webp`)
  const albumTitle = parts.length ? [yearFolder, ...parts].join(' ') : `${yearFolder} ${category}`
  const albumKey = `drive:${[category, yearFolder, ...parts].join('/')}`
  return { category, year: Number(yearFolder), albumKey, albumTitle, itemKey: `drive:${hash(relativeOutput)}`, relativeOutput }
}

async function upsertPhotoRecord(client: Client, location: PhotoLocation, objectPath: string, eventDate: Date) {
  await client.query('BEGIN')
  try {
    const album: any = await client.query(
      `INSERT INTO photo_albums (title, slug, legacy_key, tags, event_date, cover_image_url, image_count)
       VALUES ($1, $2, $3, $4, $5, $6, 0)
       ON CONFLICT (legacy_key) DO UPDATE
       SET title = EXCLUDED.title,
           tags = EXCLUDED.tags,
           event_date = GREATEST(photo_albums.event_date, EXCLUDED.event_date),
           updated_at = now()
       RETURNING id`,
      [location.albumTitle, `drive-album-${hash(location.albumKey)}`, location.albumKey, location.category, eventDate.toISOString(), objectPath],
    )
    const albumId = album.rows[0].id as number
    await client.query(
      `INSERT INTO photo_items (legacy_id, album_id, image_url, sort_order, event_date)
       VALUES ($1, $2, $3, 0, $4)
       ON CONFLICT (legacy_id) DO UPDATE
       SET album_id = EXCLUDED.album_id,
           image_url = EXCLUDED.image_url,
           event_date = EXCLUDED.event_date,
           updated_at = now()`,
      [location.itemKey, albumId, objectPath, eventDate.toISOString()],
    )
    await client.query(
      `UPDATE photo_albums
       SET image_count = (SELECT count(*) FROM photo_items WHERE album_id = $1),
           cover_image_url = COALESCE(cover_image_url, $2),
           updated_at = now()
       WHERE id = $1`,
      [albumId, objectPath],
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

async function processPhoto(client: Client | null, source: string) {
  const relativeSource = path.relative(uploadRoot, source)
  const location = photoLocation(relativeSource)
  const relativeOutput = location.relativeOutput
  const resizedFile = path.join(resizedRoot, relativeOutput)
  const rawFile = path.join(rawRoot, relativeSource)
  const r2ObjectPath = objectPath(relativeOutput)
  const remoteFile = `${r2Remote}/${relativeOutput.split(path.sep).join('/')}`

  if (statSync(source).size < minBytes) {
    console.log(`SKIP (smaller than ${minBytes} bytes): ${relativeSource}`)
    return 'skipped'
  }

  assertNoCollision(rawFile, 'RAW archive destination')
  const resizedAlreadyExists = existsSync(resizedFile)

  if (dryRun) {
    console.log(`DRY RUN${resizedAlreadyExists ? ' (resume)' : ''}: ${relativeSource} -> ${relativeOutput} -> ${remoteFile} [category: ${location.category}; album: ${location.albumTitle}]`)
    return 'processed'
  }

  if (resizedAlreadyExists) {
    // A previous run may have completed the R2/local copy but stopped before
    // recording or archiving. Repeating the idempotent upload/upsert lets the
    // next daily run finish safely instead of leaving the original stranded.
    runRclone(resizedFile, remoteFile)
    if (!client) throw new Error('Database connection is unavailable.')
    await upsertPhotoRecord(client, location, r2ObjectPath, new Date(Date.UTC(location.year, 0, 1)))
    moveOriginal(source, rawFile)
    console.log(`RESUMED: ${relativeSource}`)
    return 'processed'
  }

  const tempFile = path.join(os.tmpdir(), `lc-photo-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`)
  try {
    await sharp(source, { failOn: 'error', animated: false })
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toFile(tempFile)

    runRclone(tempFile, remoteFile)
    mkdirSync(path.dirname(resizedFile), { recursive: true })
    // /tmp and the Windows-mounted Drive are different filesystems in WSL, so
    // rename() is not reliable here. Copy first; the original remains in
    // UPLOAD until this has completed.
    copyFileSync(tempFile, resizedFile)
    if (!client) throw new Error('Database connection is unavailable.')
    await upsertPhotoRecord(client, location, r2ObjectPath, new Date(Date.UTC(location.year, 0, 1)))
    moveOriginal(source, rawFile)
    console.log(`DONE: ${relativeSource}`)
    return 'processed'
  } finally {
    if (existsSync(tempFile)) rmSync(tempFile, { force: true })
  }
}

async function main() {
  if (!existsSync(uploadRoot)) throw new Error(`UPLOAD folder does not exist: ${uploadRoot}`)
  for (const directory of [resizedRoot, rawRoot]) {
    if (existsSync(directory) && !lstatSync(directory).isDirectory()) throw new Error(`Expected a folder: ${directory}`)
  }

  const photos = walk(uploadRoot)
  const client = dryRun ? null : new Client({ connectionString: databaseUri! })
  if (client) await client.connect()
  let processed = 0
  let skipped = 0
  let failed = 0
  try {
    for (const photo of photos) {
      try {
        const outcome = await processPhoto(client, photo)
        if (outcome === 'processed') processed += 1
        else skipped += 1
      } catch (error) {
        failed += 1
        console.error(`FAILED: ${path.relative(uploadRoot, photo)}\n${error instanceof Error ? error.message : error}`)
      }
    }
  } finally {
    if (client) await client.end()
  }
  console.log(`Finished: ${processed} processed, ${skipped} skipped, ${failed} failed.`)
  if (failed) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
