import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Imports the latest public uploads from all church YouTube channels.
 *
 * Usage: pnpm sync:youtube
 */
import { syncYouTubeChannels } from '../src/lib/youtube-sync.ts'

for (const name of ['.env', '.env.local']) {
  const envFile = path.resolve(process.cwd(), name)
  if (!existsSync(envFile)) continue
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/)
    if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].replace(/^['"]|['"]$/g, '')
  }
}

syncYouTubeChannels()
  .then((result) => {
    console.log(`Synced ${result.synced} YouTube videos from ${result.channels} channels.`)
    for (const failure of result.failures) console.warn(`Channel sync failed: ${failure}`)
    if (result.failures.length) process.exitCode = 1
  })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
