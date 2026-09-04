import fs from 'node:fs'
import path from 'node:path'

for (const fileName of ['.env.local', '.env']) {
  const filePath = path.join(process.cwd(), fileName)
  if (!fs.existsSync(filePath)) continue
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}

const [{ default: config }, { getPayload }] = await Promise.all([
  import('../src/payload.config'),
  import('payload'),
])

async function main() {
  const payload = await getPayload({ config })
  const reservations = await payload.find({ collection: 'room-reservations', limit: 10000, depth: 0, overrideAccess: true })
  let deleted = 0
  for (const reservation of reservations.docs) {
    await payload.delete({ collection: 'room-reservations', id: reservation.id, overrideAccess: true })
    deleted += 1
  }
  console.log(JSON.stringify({ found: reservations.docs.length, deleted }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
