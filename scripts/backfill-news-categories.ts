/**
 * Assign ministry categories to existing News records from their titles and content.
 * Existing categories are preserved so manually selected values are never overwritten.
 *
 * Preview: pnpm backfill:news-categories --dry-run
 * Apply:   pnpm backfill:news-categories
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

import { categoryForNewsText } from '../src/lib/news-categories.ts'

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

type NewsRow = {
  id: number
  title_ko: string | null
  title_en: string | null
  content_ko: unknown
  content_en: unknown
}

const text = (value: unknown) => typeof value === 'string' ? value : JSON.stringify(value ?? '')

async function main() {
  const client = new Client({ connectionString: databaseURI })
  await client.connect()
  try {
    const result = await client.query(`
      SELECT id, title_ko, title_en, content_ko, content_en
      FROM news
      WHERE category IS NULL
      ORDER BY id ASC
    `) as { rows: NewsRow[] }
    const updates = result.rows.flatMap((news) => {
      const category = categoryForNewsText([news.title_ko, news.title_en, text(news.content_ko), text(news.content_en)].filter(Boolean).join('\n'))
      return category ? [{ id: news.id, category }] : []
    })

    console.log(`${updates.length} of ${result.rows.length} uncategorized News records match a ministry category.`)
    if (dryRun) return

    for (const update of updates) {
      await client.query('UPDATE news SET category = $1, updated_at = now() WHERE id = $2', [update.category, update.id])
    }
    console.log(`Updated ${updates.length} News categories.`)
  } finally {
    await client.end()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
