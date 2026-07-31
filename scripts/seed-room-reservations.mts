import config from '../src/payload.config.ts'
import { getPayload } from 'payload'

const samples = [
  { room: '대예배실', date: '2026-07-05', startTime: '09:00', endTime: '12:00', name: '예배팀', purpose: '주일 예배', email: 'worship@example.com', phone: '512-555-0101', status: 'approved' },
  { room: 'Room 101', date: '2026-07-08', startTime: '18:00', endTime: '20:00', name: '청년부', purpose: '성경 공부 모임', email: 'youngadults@example.com', phone: '512-555-0102', status: 'approved' },
  { room: '유스 예배실', date: '2026-07-12', startTime: '14:00', endTime: '16:00', name: '유스 사역팀', purpose: '리더 모임', email: 'youth@example.com', phone: '512-555-0103', status: 'approved' },
  { room: '다목적 예배실', date: '2026-07-18', startTime: '10:00', endTime: '13:00', name: '교육부', purpose: '여름 특별 행사', email: 'education@example.com', phone: '512-555-0104', status: 'waiting' },
  { room: 'Room 201', date: '2026-07-25', startTime: '15:00', endTime: '17:00', name: '소그룹', purpose: '소그룹 친교 모임', email: 'group@example.com', phone: '512-555-0105', status: 'approved' },
]

const payload = await getPayload({ config })
const rooms = await payload.find({ collection: 'rooms', limit: 100, overrideAccess: true })
for (const sample of samples) {
  const room = rooms.docs.find((item: any) => item.nameKo === sample.room)
  if (!room) throw new Error(`Room not found: ${sample.room}`)
  const existing = await payload.find({ collection: 'room-reservations', where: { and: [{ date: { equals: sample.date } }, { room: { equals: room.id } }, { startTime: { equals: sample.startTime } }] }, limit: 1, overrideAccess: true })
  if (existing.totalDocs) continue
  await payload.create({ collection: 'room-reservations', data: { ...sample, room: room.id }, overrideAccess: true })
  console.log(`Seeded ${sample.date} ${sample.room}`)
}
console.log('Room reservation seed complete')
process.exit(0)
