/**
 * OCR and import announcements from one scanned bulletin.
 * Usage: pnpm tsx scripts/import-bulletin-news.ts 2026-07-13
 */
import { execFile } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { Client } from 'pg'
import { parseBulletinAnnouncements } from '../src/lib/bulletin-news.ts'
import { categoryForNewsText } from '../src/lib/news-categories.ts'

const run = promisify(execFile)
const date = process.argv[2]
if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('Usage: pnpm tsx scripts/import-bulletin-news.ts YYYY-MM-DD')

const env = Object.fromEntries(['.env', '.env.local'].flatMap((name) => {
  const file = path.resolve(process.cwd(), name)
  if (!existsSync(file)) return []
  return readFileSync(file, 'utf8').split(/\r?\n/).map((line) => {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/)
    return match ? [match[1].trim(), match[2].replace(/^['"]|['"]$/g, '')] : []
  }).filter((entry) => entry.length === 2)
}))
const databaseURI = process.env.DATABASE_URI || env.DATABASE_URI
const publicURL = (process.env.R2_PUBLIC_URL || env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')
if (!databaseURI) throw new Error('DATABASE_URI is required')

const lexical = (text: string) => ({ root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: null, children: text.split(/(?<=\.)\s+/).flatMap((sentence, index, list) => [{ type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text: sentence }, ...(index < list.length - 1 ? [{ type: 'linebreak', version: 1 }] : [])]) }] } })

async function ocrBulletin(url: string, workingDirectory: string) {
  const pdf = path.join(workingDirectory, 'bulletin.pdf')
  const imagePrefix = path.join(workingDirectory, 'page')
  const crop = path.join(workingDirectory, 'announcements.png')
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Unable to download bulletin PDF (${response.status})`)
  await writeFile(pdf, Buffer.from(await response.arrayBuffer()))
  await run('pdftoppm', ['-f', '1', '-l', '1', '-png', '-r', '144', pdf, imagePrefix])
  // Bulletin PDFs use a fixed three-column layout; this isolates the middle announcements column.
  await run('sips', ['-c', '700', '600', '--cropOffset', '0', '620', `${imagePrefix}-1.png`, '--out', crop])
  const { stdout: croppedText } = await run('tesseract', [crop, 'stdout', '-l', 'kor+eng', '--psm', '6'])
  const { stdout: fullPageText } = await run('tesseract', [`${imagePrefix}-1.png`, 'stdout', '-l', 'kor+eng', '--psm', '6'])
  return { croppedText, fullPageText }
}

async function main() {
  const client = new Client({ connectionString: databaseURI })
  await client.connect()
  const workingDirectory = path.join(tmpdir(), `lcaustin-bulletin-${date}-${Date.now()}`)
  try {
    const bulletinResult: any = await client.query('SELECT id, issue_date, filename, prefix FROM bulletins WHERE issue_date::date = $1 LIMIT 1', [date])
    const bulletin = bulletinResult.rows[0]
    if (!bulletin) throw new Error(`No bulletin found for ${date}`)
    const key = [bulletin.prefix, bulletin.filename].filter(Boolean).join('/')
    if (!key) throw new Error(`Bulletin ${date} has no uploaded PDF filename`)
    await mkdir(workingDirectory, { recursive: true })
    const { croppedText, fullPageText } = await ocrBulletin(`${publicURL}/${key}`, workingDirectory)
    const articles = parseBulletinAnnouncements(croppedText)
    if (!articles.length) articles.push(...parseBulletinAnnouncements(fullPageText))
    if (!articles.length) throw new Error('No eligible announcements found. Check the bulletin layout or OCR output.')

    await client.query('BEGIN')
    await client.query('DELETE FROM news WHERE source_bulletin_id = $1', [bulletin.id])
    for (const [index, article] of articles.entries()) {
      await client.query(`
        INSERT INTO news (admin_title, title_ko, title_en, content_ko, content_en, category, date, source_bulletin_id, extraction_key, slug, created_at, updated_at)
        SELECT $1, $2, '', $3, $4, $5, $6, $7, $8, $9, now(), now()
        WHERE NOT EXISTS (SELECT 1 FROM news WHERE title_ko = $2)
      `, [article.title, article.title, lexical(article.body), lexical(''), categoryForNewsText(`${article.title}\n${article.body}`) ?? null, bulletin.issue_date, bulletin.id, `${bulletin.id}:${index + 1}`, `bulletin-${date}-${index + 1}`])
    }
    await client.query('COMMIT')
    console.log(`Imported ${articles.length} announcements from ${date}.`)
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    await client.end()
    await rm(workingDirectory, { recursive: true, force: true })
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
