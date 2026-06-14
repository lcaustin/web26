---
name: gdrive-photo-sync
description: >
  Syncs photos from a Google Drive folder into Payload CMS media collection,
  using subfolder names as tags. Resizes oversized images with sharp before
  importing. Creates a database record for each image and skips files that
  have already been imported (idempotent). Use this skill whenever the user
  says things like "sync photos from Google Drive", "import church photos from
  Drive", "run the photo sync", "pull images from Drive into the CMS", or
  "sync the media library from Google Drive". Also trigger when the user wants
  to set up, configure, or run the batch photo import pipeline.
---

# Google Drive → Payload CMS Photo Sync

Scans a Google Drive folder hierarchy, downloads images, resizes if needed,
and creates `media` records in Payload CMS. Subfolders become tags.
The script is idempotent — re-running it skips already-imported files.

---

## Prerequisites Checklist

Before running, confirm these are in place:

- [ ] Google Cloud project with **Drive API** enabled
- [ ] **Service account** created and JSON key downloaded
- [ ] Target Drive folder shared with the service account email
- [ ] Payload `media` collection has `tags` and `googleDriveId` fields (see below)
- [ ] `.env.local` has the required variables
- [ ] `googleapis`, `sharp`, `form-data` installed

---

## Step 1 — Google Cloud Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create or select a project
3. Enable **Google Drive API** under APIs & Services
4. Go to **Credentials → Create Credentials → Service Account**
5. Download the JSON key → save as `service-account.json` in the project root
6. Add `service-account.json` to `.gitignore`
7. Open your Google Drive folder → Share → paste the service account email → Viewer role

### Recommended Drive Folder Structure

```
📁 Church Photos/                ← ROOT_FOLDER_ID points here
├── 📁 Sunday Service/           → tag: "sunday-service"
├── 📁 Youth Group/              → tag: "youth-group"
├── 📁 Baptism 2025/             → tag: "baptism-2025"
└── 📁 Christmas Concert/        → tag: "christmas-concert"
```

Each subfolder name becomes a slugified tag on every image inside it.

---

## Step 2 — Payload Media Collection Schema

Add these fields to your `media` collection if not already present:

```ts
// collections/Media.ts
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, crop: 'center' },
      { name: 'card',      width: 800, height: 600, crop: 'center' },
      { name: 'full',      width: 1920, height: undefined },
    ],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      name: 'googleDriveId',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Used to prevent duplicate imports' },
    },
    {
      name: 'sourceFolder',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
}
```

After editing the collection, run:
```bash
pnpm payload migrate:create
pnpm payload migrate
```

---

## Step 3 — Environment Variables

Add to `.env.local`:

```env
GOOGLE_SERVICE_ACCOUNT_PATH=./service-account.json
GOOGLE_DRIVE_ROOT_FOLDER_ID=1abc123xxxxxxxxxxxxx

PAYLOAD_SECRET=your-payload-secret
PAYLOAD_URL=http://localhost:3000
```

To find `GOOGLE_DRIVE_ROOT_FOLDER_ID`: open the root folder in Google Drive — the ID is the last segment of the URL:
`https://drive.google.com/drive/folders/THIS_IS_THE_ID`

---

## Step 4 — Install Dependencies

```bash
pnpm add googleapis sharp
pnpm add -D @types/node
```

---

## Step 5 — The Sync Script

Create `scripts/sync-drive-photos.ts`:

```ts
import { google } from 'googleapis'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import payload from 'payload'
import config from '../payload.config'

// ─── Config ────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_PATH ?? './service-account.json'
const ROOT_FOLDER_ID       = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!
const MAX_WIDTH            = 1920
const MAX_SIZE_MB          = 2

// ─── Google Auth ────────────────────────────────────────────────────────────
async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  return google.drive({ version: 'v3', auth })
}

// ─── Drive Helpers ──────────────────────────────────────────────────────────
async function listFolders(drive: any, parentId: string) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
  })
  return res.data.files ?? []
}

async function listImages(drive: any, folderId: string) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: 'files(id, name, mimeType, size)',
  })
  return res.data.files ?? []
}

async function downloadImage(drive: any, fileId: string): Promise<Buffer> {
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  )
  return Buffer.from(res.data)
}

// ─── Image Processing ───────────────────────────────────────────────────────
async function resizeIfNeeded(buffer: Buffer): Promise<Buffer> {
  const meta   = await sharp(buffer).metadata()
  const sizeMB = buffer.length / (1024 * 1024)

  if ((meta.width ?? 0) <= MAX_WIDTH && sizeMB <= MAX_SIZE_MB) {
    return buffer
  }

  console.log(`  ↳ Resizing (${meta.width}px, ${sizeMB.toFixed(1)}MB) → max ${MAX_WIDTH}px / ${MAX_SIZE_MB}MB`)

  return sharp(buffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toBuffer()
}

// ─── Slug helper ────────────────────────────────────────────────────────────
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Duplicate Check ────────────────────────────────────────────────────────
async function alreadyImported(driveId: string): Promise<boolean> {
  const result = await payload.find({
    collection: 'media',
    where: { googleDriveId: { equals: driveId } },
    limit: 1,
  })
  return result.totalDocs > 0
}

// ─── Payload Import ─────────────────────────────────────────────────────────
async function importToPayload({
  buffer,
  filename,
  mimeType,
  tag,
  folderName,
  driveId,
}: {
  buffer: Buffer
  filename: string
  mimeType: string
  tag: string
  folderName: string
  driveId: string
}) {
  await payload.create({
    collection: 'media',
    data: {
      alt: filename.replace(/\.[^.]+$/, ''),
      tags: [{ tag }],
      googleDriveId: driveId,
      sourceFolder: folderName,
    },
    file: {
      data: buffer,
      mimetype: mimeType,
      name: filename,
      size: buffer.length,
    },
  })
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  await payload.init({ config, local: true })

  const drive   = await getDriveClient()
  const folders = await listFolders(drive, ROOT_FOLDER_ID)

  console.log(`Found ${folders.length} folder(s) to process\n`)

  let imported = 0
  let skipped  = 0
  let failed   = 0

  for (const folder of folders) {
    const tag    = slugify(folder.name)
    const images = await listImages(drive, folder.id)

    console.log(`📁 ${folder.name} (${images.length} images) → tag: "${tag}"`)

    for (const image of images) {
      const isDuplicate = await alreadyImported(image.id)
      if (isDuplicate) {
        console.log(`  ⏭  Skipping (already imported): ${image.name}`)
        skipped++
        continue
      }

      try {
        const raw     = await downloadImage(drive, image.id)
        const buffer  = await resizeIfNeeded(raw)

        await importToPayload({
          buffer,
          filename:   image.name,
          mimeType:   image.mimeType,
          tag,
          folderName: folder.name,
          driveId:    image.id,
        })

        console.log(`  ✅ Imported: ${image.name}`)
        imported++
      } catch (err) {
        console.error(`  ❌ Failed: ${image.name}`, err)
        failed++
      }
    }

    console.log()
  }

  console.log('─'.repeat(40))
  console.log(`✅ Imported : ${imported}`)
  console.log(`⏭  Skipped  : ${skipped}`)
  console.log(`❌ Failed   : ${failed}`)

  process.exit(0)
}

main()
```

---

## Step 6 — Add Script to package.json

```json
{
  "scripts": {
    "sync-photos": "dotenv -e .env.local -- ts-node --project tsconfig.json scripts/sync-drive-photos.ts"
  }
}
```

Install `dotenv-cli` if not present:
```bash
pnpm add -D dotenv-cli ts-node
```

Run:
```bash
pnpm sync-photos
```

---

## Step 7 — Optional: Schedule as Cron Job (VPS)

To run automatically every night at midnight:

```bash
crontab -e
```

Add:
```
0 0 * * * cd /home/yourapp/web26 && pnpm sync-photos >> /var/log/photo-sync.log 2>&1
```

---

## Troubleshooting

| Error | Fix |
|---|---|
| `The caller does not have permission` | Re-share the Drive folder with the service account email |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID not set` | Check `.env.local` is loaded and the variable is set |
| `unique constraint failed on googleDriveId` | Safe to ignore — means the duplicate check missed a race condition; the record already exists |
| `sharp` errors on ARM/Mac | Run `pnpm rebuild sharp` |
| Images not appearing in Admin UI | Check that `staticDir` in the collection matches your actual `public/media` path |

---

## Notes

- The script processes **one level of subfolders** only. Nested subfolders are not recursed.
- Only files with `mimeType` starting with `image/` are imported; PDFs and videos are skipped automatically.
- Running the script multiple times is safe — the `googleDriveId` uniqueness check prevents duplicates.
- To force a re-import of a specific image, delete its record in Payload Admin UI first.