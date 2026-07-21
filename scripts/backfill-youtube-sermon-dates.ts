/**
 * Aligns YouTube sermon dates with the leading YYYY-MM-DD in their titles.
 * Sermons can be uploaded after Sunday, so YouTube's publish time is not
 * necessarily the actual service date.
 *
 * Usage: pnpm backfill:youtube-sermon-dates
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

function databaseUriFromEnvFile() {
  for (const name of ['.env.local', '.env']) {
    const file = path.resolve(process.cwd(), name)
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/)
      if (match?.[1].trim() === 'DATABASE_URI') return match[2].replace(/^['"]|['"]$/g, '')
    }
  }
  return undefined
}

const databaseUri = process.env.DATABASE_URI || databaseUriFromEnvFile()
if (!databaseUri) throw new Error('DATABASE_URI is required.')
const connectionString: string = databaseUri

async function main() {
  const client = new Client({ connectionString })
  await client.connect()
  try {
    const result: any = await client.query(
      `UPDATE videos
       SET published_at = (substring(admin_title FROM '^\\s*(\\d{4}-\\d{2}-\\d{2})') || 'T12:00:00.000Z')::timestamptz,
           updated_at = now()
       WHERE source = 'youtube'
         AND category = 'sermon'
         AND admin_title ~ '^\\s*\\d{4}-\\d{2}-\\d{2}'
         AND published_at IS DISTINCT FROM (substring(admin_title FROM '^\\s*(\\d{4}-\\d{2}-\\d{2})') || 'T12:00:00.000Z')::timestamptz`,
    )
    console.log(`Updated ${result.rowCount ?? 0} YouTube sermon dates.`)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
