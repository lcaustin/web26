/**
 * Splits legacy bilingual News admin titles into Korean and English title fields.
 *
 * Preview: pnpm backfill:news-titles --dry-run
 * Apply:   pnpm backfill:news-titles
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

import { splitBilingualTitle } from '../src/lib/bulletin-news.ts'

const dryRun = process.argv.includes('--dry-run')
const env = Object.fromEntries(['.env', '.env.local'].flatMap((name) => {
  const file = path.resolve(process.cwd(), name)
  if (!existsSync(file)) return []
  return readFileSync(file, 'utf8').split(/\r?\n/).map((line) => {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/)
    return match ? [match[1].trim(), match[2].replace(/^['"]|['"]$/g, '')] : []
  }).filter((entry) => entry.length === 2)
}))
const databaseURI = process.env.DATABASE_URI || env.DATABASE_URI
if (!databaseURI) throw new Error('DATABASE_URI is required')

type NewsRow = { id: number; admin_title: string }

async function main() {
  const client = new Client({ connectionString: databaseURI })
  await client.connect()
  try {
    const result = await client.query(`
      SELECT id, admin_title
      FROM news
      WHERE admin_title LIKE '%/%'
        AND COALESCE(title_en, '') = ''
      ORDER BY id ASC
    `) as { rows: NewsRow[] }
    const updates = result.rows.map((news) => ({ id: news.id, ...splitBilingualTitle(news.admin_title) }))

    console.log(`${updates.length} News titles can be split into Korean and English fields.`)
    if (dryRun) return

    for (const update of updates) {
      await client.query(
        'UPDATE news SET title_ko = $1, title_en = $2, updated_at = now() WHERE id = $3',
        [update.title, update.titleEn, update.id],
      )
    }
    console.log(`Updated ${updates.length} News titles.`)
  } finally {
    await client.end()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
