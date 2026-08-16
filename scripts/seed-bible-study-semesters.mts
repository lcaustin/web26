import config from '../src/payload.config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })
  const existingSemester = await payload.find({
    collection: 'bible-study-semesters',
    where: { name: { equals: '2026 Spring' } },
    limit: 1,
  })
  const semester = existingSemester.docs[0] ?? await payload.create({
    collection: 'bible-study-semesters',
    data: { name: '2026 Spring', status: 'before', active: true },
  })

  const groups = await payload.find({
    collection: 'bible-studies',
    where: {
      or: [
        { 'semester.en': { equals: '2026 Spring' } },
        { 'semester.ko': { equals: '2026 상반기' } },
      ],
    },
    limit: 1000,
  })

  let updated = 0
  for (const group of groups.docs) {
    if (group.semesterRef !== semester.id) {
      await payload.update({
        collection: 'bible-studies',
        id: group.id,
        data: { semesterRef: semester.id },
      })
      updated += 1
    }
  }

  console.log(JSON.stringify({ semesterId: semester.id, groupsFound: groups.docs.length, groupsUpdated: updated }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
