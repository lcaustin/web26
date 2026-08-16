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

type GroupSeed = {
  courseType: 'coffee-break' | 'first-steps' | 'panorama'
  subject?: string
  targetGroup?: string
  instructor: string
  time: string
}

const groups: GroupSeed[] = [
  { courseType: 'coffee-break', targetGroup: '월요일 여성반', instructor: '최나형', time: '월요일 저녁 7:30' },
  { courseType: 'coffee-break', targetGroup: '주일 대면 혼성반', instructor: '이우재', time: '주일 오전 9:30' },
  { courseType: 'coffee-break', targetGroup: '월요일 여성반', instructor: '이세화', time: '월요일 오전 10:00' },
  { courseType: 'coffee-break', targetGroup: '월요일 남성반', instructor: '엄영만', time: '월요일 저녁 7:30' },
  { courseType: 'coffee-break', targetGroup: '월요일 사역자반', instructor: '허양희', time: '월요일 저녁 7:30' },
  { courseType: 'coffee-break', targetGroup: '화요일 남성반', instructor: '유영범', time: '화요일 저녁 7:30' },
  { courseType: 'coffee-break', targetGroup: '화요일 여성반', instructor: '김재영', time: '화요일 저녁 7:30' },
  { courseType: 'coffee-break', targetGroup: '수요일 여성반', instructor: '곽미애', time: '수요일 오전 10:00' },
  { courseType: 'coffee-break', targetGroup: '수요일 여성반', instructor: '변윤진', time: '수요일 저녁 7:30' },
  { courseType: 'coffee-break', targetGroup: '수요일 남성반', instructor: '김대인', time: '수요일 저녁 7:30' },
  { courseType: 'first-steps', instructor: '김선우', time: '수요일 저녁 7:30' },
  { courseType: 'coffee-break', targetGroup: '목요일 여성반', instructor: '문주희', time: '목요일 오전 10:00' },
  { courseType: 'coffee-break', targetGroup: '목요일 여성반', instructor: '김지영', time: '목요일 저녁 7:30' },
  { courseType: 'coffee-break', targetGroup: '목요일 남성반', instructor: '이기욱', time: '목요일 저녁 7:30' },
  { courseType: 'panorama', subject: '구약', instructor: '박소명', time: '목요일 저녁 8:00' },
  { courseType: 'coffee-break', targetGroup: '금요일 여성반', instructor: '장은혜', time: '금요일 오전 10:00' },
  { courseType: 'coffee-break', targetGroup: '토요일 남성반', instructor: '정민호', time: '토요일 오전 10:00' },
  { courseType: 'panorama', subject: '신약', instructor: '한종석', time: '토요일 오전 10:00' },
  { courseType: 'coffee-break', targetGroup: '대학청년부 여성반', instructor: '권한나', time: '수요일 저녁 7:30' },
  { courseType: 'coffee-break', targetGroup: '대학청년부 남성반', instructor: '박민서', time: '목요일 저녁 7:30' },
]

async function main() {
  const payload = await getPayload({ config })
  const semesterResult = await payload.find({ collection: 'bible-study-semesters', where: { name: { equals: '2026 Fall' } }, limit: 1 })
  const semester = semesterResult.docs[0] ?? await payload.create({
    collection: 'bible-study-semesters',
    data: { name: '2026 Fall', status: 'before', active: true },
  })

  const courseTypes = await payload.find({ collection: 'bible-study-course-types', limit: 100, depth: 0 })
  const typeBySlug = new Map(courseTypes.docs.map((type) => [type.slug, type]))
  const semesterGroups = await payload.find({
    collection: 'bible-studies',
    where: { semesterRef: { equals: semester.id } },
    limit: 1000,
    depth: 0,
  })
  let created = 0
  let skipped = 0

  for (const group of groups) {
    const courseType = typeBySlug.get(group.courseType)
    if (!courseType) throw new Error(`Missing course type: ${group.courseType}`)
    const existing = semesterGroups.docs.some((study) =>
      study.instructor?.ko === group.instructor && study.timeDescription?.ko === group.time)
    if (existing) { skipped += 1; continue }

    await payload.create({
      collection: 'bible-studies',
      data: {
        courseType: group.courseType,
        courseTypeRef: courseType.id,
        semesterRef: semester.id,
        subject: group.subject,
        targetGroup: group.targetGroup ? { ko: group.targetGroup, en: '' } : undefined,
        timeDescription: { ko: group.time, en: '' },
        instructor: { ko: group.instructor, en: '' },
        status: 'before',
        active: true,
      },
    })
    semesterGroups.docs.push({ instructor: { ko: group.instructor }, timeDescription: { ko: group.time } } as never)
    created += 1
  }

  console.log(JSON.stringify({ semesterId: semester.id, created, skipped }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
