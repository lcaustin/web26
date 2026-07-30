import config from '../src/payload.config'
import { getPayload } from 'payload'

const types = [
  { slug: 'coffee-break', name: { ko: '커피브레이크', en: 'Coffee Break' }, order: 1 },
  { slug: 'panorama', name: { ko: '신구약 맥잡기', en: 'Bible Panorama' }, order: 2 },
  { slug: 'crown', name: { ko: '크라운 재정교실', en: 'Crown Financial Class' }, order: 3 },
  { slug: 'first-steps', name: { ko: '신앙의 첫걸음', en: 'First Steps of Faith' }, order: 4 },
]

async function main() {
  const payload = await getPayload({ config })
  let created = 0
  let linked = 0
  for (const type of types) {
    const found = await payload.find({ collection: 'bible-study-course-types', where: { slug: { equals: type.slug } }, limit: 1 })
    const doc = found.docs[0] ?? await payload.create({ collection: 'bible-study-course-types', data: type })
    if (!found.docs[0]) created += 1
    const groups = await payload.find({ collection: 'bible-studies', where: { courseType: { equals: type.slug } }, limit: 1000 })
    for (const group of groups.docs) {
      if (group.courseTypeRef !== doc.id) {
        await payload.update({ collection: 'bible-studies', id: group.id, data: { courseTypeRef: doc.id } })
        linked += 1
      }
    }
  }
  console.log(JSON.stringify({ created, linked }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
