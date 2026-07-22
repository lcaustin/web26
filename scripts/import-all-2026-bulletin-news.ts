/**
 * Imports every 2026-and-newer bulletin that does not already have News records linked
 * through `source_bulletin_id`.
 *
 * Preview: pnpm tsx scripts/import-all-2026-bulletin-news.ts --dry-run
 * Import:  pnpm tsx scripts/import-all-2026-bulletin-news.ts
 */
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

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

const run = (date: string) => new Promise<void>((resolve, reject) => {
  const child = spawn('pnpm', ['tsx', 'scripts/import-bulletin-news.ts', date], { stdio: 'inherit', shell: process.platform === 'win32' })
  child.on('error', reject)
  child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Import failed for ${date} (exit ${code})`)))
})

async function main() {
  const client = new Client({ connectionString: databaseURI })
  await client.connect()
  try {
    const result: any = await client.query(`
      SELECT b.issue_date::date AS date
      FROM bulletins b
      WHERE b.issue_date >= '2026-01-01'
        AND NOT EXISTS (
          SELECT 1 FROM news n WHERE n.source_bulletin_id = b.id
        )
      ORDER BY b.issue_date ASC
    `)
    const dates = result.rows.map((row: { date: string | Date }) => row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date.slice(0, 10))
    console.log(`${dates.length} bulletin(s) need importing:`, dates.join(', ') || 'none')
    if (dryRun) return
    const failures: string[] = []
    for (const date of dates) {
      try {
        await run(date)
      } catch (error) {
        failures.push(date)
        console.error(error)
      }
    }
    if (failures.length) {
      console.error(`Could not import: ${failures.join(', ')}`)
      process.exitCode = 1
    }
  } finally {
    await client.end()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
