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

const rooms = [
  ['101 대예배실', '101 Main Sanctuary'], ['102 미디어실', '102 Media Room'], ['103 통역실', '103 Translation Room'], ['104 사무실', '104 Office'],
  ['105 리셉션', '105 Reception'], ['106 영아부실', '106 Nursery'], ['107 어머니방', "107 Mother's Room"], ['108 유아부실', '108 Preschool'],
  ['109 도서관', '109 Library'], ['110 유아부 사무실', '110 Preschool Office'], ['111 다목적 예배실', '111 Multipurpose Room'], ['112 관리실', '112 Maintenance Room'],
  ['113 가온 사무실', '113 Gaon Office'], ['114 새가족실', '114 Newcomers Room'],
  ['201 초등부 예배실', '201 Elementary Worship Hall'], ['202 C-1', '202 C-1'], ['203 C-2', '203 C-2'], ['204 C-3', '204 C-3'], ['205 C-4', '205 C-4'],
  ['206 C-5', '206 C-5'], ['207 C-6', '207 C-6'], ['208 C-7', '208 C-7'], ['209 컨퍼런스룸', '209 Conference Room'], ['210 시니어룸', '210 Senior Room'],
  ['211 대학부실', '211 College Room'], ['212 C-8', '212 C-8'], ['213 서버실', '213 Server Room'], ['214 유스 예배실', '214 Youth Worship Hall'],
  ['215 C-9', '215 C-9'], ['216 보드룸', '216 Board Room'], ['217 담임목사실', '217 Senior Pastor Office'], ['218 C-10', '218 C-10'], ['219 C-11', '219 C-11'],
  ['220 C-12', '220 C-12'], ['221 C-13', '221 C-13'], ['222 C-14', '222 C-14'], ['223 C-15', '223 C-15'], ['224 C-16', '224 C-16'], ['225 C-17', '225 C-17'],
] as const

async function main() {
  const payload = await getPayload({ config })
  const existing = await payload.find({ collection: 'rooms', limit: 1000, depth: 0, overrideAccess: true })
  const names = new Set(rooms.map(([, nameEn]) => nameEn))
  const syncedIds = new Set<string>()
  let created = 0
  let updated = 0
  let deactivated = 0

  for (const [index, [nameKo, nameEn]] of rooms.entries()) {
    const roomNumber = nameEn.match(/^\d+/)?.[0]
    const cleanNameKo = nameKo.replace(/^\d+\s*/, '')
    const cleanNameEn = nameEn.replace(/^\d+\s*/, '')
    const found = existing.docs.find((room: any) => room.nameEn === nameEn || (roomNumber && new RegExp(`(?:^|\\s)${roomNumber}(?:\\s|$)`).test(room.nameEn)))
    if (found) {
      syncedIds.add(String(found.id))
      await payload.update({ collection: 'rooms', id: found.id, data: { roomNumber: Number(roomNumber), nameKo: cleanNameKo, nameEn: cleanNameEn, order: index + 1, active: true }, overrideAccess: true })
      updated += 1
    } else {
      const createdRoom = await payload.create({ collection: 'rooms', data: { roomNumber: Number(roomNumber), nameKo: cleanNameKo, nameEn: cleanNameEn, order: index + 1, active: true }, overrideAccess: true })
      syncedIds.add(String(createdRoom.id))
      created += 1
    }
  }

  for (const room of existing.docs as any[]) {
    if (!syncedIds.has(String(room.id)) && !names.has(room.nameEn) && room.active !== false) {
      await payload.update({ collection: 'rooms', id: room.id, data: { active: false }, overrideAccess: true })
      deactivated += 1
    }
  }

  console.log(JSON.stringify({ blueprintRooms: rooms.length, created, updated, deactivated }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
