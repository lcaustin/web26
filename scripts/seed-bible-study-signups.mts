import config from '../src/payload.config'
import { getPayload } from 'payload'

const sampleNames = ['김민수', '이은지', '박준호', '최서연', '정현우', '강지민', '윤도현', '한수빈', '조민재', '송예은', '임재호']

async function main() {
const payload = await getPayload({ config })
const studies = await payload.find({
  collection: 'bible-studies',
  where: { status: { not_equals: 'closed' } },
  sort: 'startDate',
  limit: 100,
})

if (!studies.docs.length) {
  throw new Error('No Bible Study groups found. Seed the groups first.')
}

let created = 0
let skipped = 0
for (let studyIndex = 0; studyIndex < studies.docs.length; studyIndex += 1) {
  const study = studies.docs[studyIndex]
  const signupCount = 6 + (studyIndex % 6)
  for (let index = 0; index < signupCount; index += 1) {
    const name = `${sampleNames[index]}${studyIndex % 2 === 0 ? '' : ' (테스트)'}`
    const email = `bible-study-${study.id}-${index + 1}@example.com`
    const phone = `512-555-${String(studyIndex * 11 + index + 1).padStart(4, '0')}`
    const existing = await payload.find({
      collection: 'bible-study-signups',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.docs.length) {
      skipped += 1
      continue
    }

    await payload.create({
      collection: 'bible-study-signups',
      data: {
        bibleStudy: study.id,
        name,
        email,
        phone,
        notes: 'Sample signup for admin CSV export testing',
      },
    })
    created += 1
  }
}

console.log(JSON.stringify({ created, skipped }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
