import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'

const coffeeBreakGroups = [
  {
    instructor: { ko: '이우재', en: 'Woojae Lee' },
    targetGroup: { ko: '월요일 남성반', en: 'Monday Men\'s Class' },
    timeDescription: { ko: '(월) 저녁 7:30', en: 'Mon 7:30 PM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 12,
  },
  {
    instructor: { ko: 'Timothy Kim', en: 'Timothy Kim' },
    targetGroup: { ko: 'English Class (영어반)', en: 'Monday English Class' },
    timeDescription: { ko: '(월) 저녁 7:30', en: 'Mon 7:30 PM' },
    location: { ko: '교육관', en: 'LC Education Center' },
    limit: 15,
  },
  {
    instructor: { ko: '박기훈', en: 'Kihun Park' },
    targetGroup: { ko: '화요일 남성반', en: 'Tuesday Men\'s Class' },
    timeDescription: { ko: '(화) 저녁 7:30', en: 'Tue 7:30 PM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 12,
  },
  {
    instructor: { ko: '김재영', en: 'Jaeyoung Kim' },
    targetGroup: { ko: '화요일 여성반', en: 'Tuesday Women\'s Class' },
    timeDescription: { ko: '(화) 저녁 7:30', en: 'Tue 7:30 PM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 12,
  },
  {
    instructor: { ko: '김대성', en: 'Daesung Kim' },
    targetGroup: { ko: '화요일 젊은부부반', en: 'Tuesday Young Couples Class' },
    timeDescription: { ko: '(화) 저녁 7:30', en: 'Tue 7:30 PM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 10,
  },
  {
    instructor: { ko: '이기욱', en: 'Kiwook Lee' },
    targetGroup: { ko: '수요일 남성반', en: 'Wednesday Men\'s Class' },
    timeDescription: { ko: '(수) 저녁 7:30', en: 'Wed 7:30 PM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 12,
  },
  {
    instructor: { ko: '권수경', en: 'Sukyoung Kwon' },
    targetGroup: { ko: '목요일 여성반', en: 'Thursday Women\'s Class' },
    timeDescription: { ko: '(목) 오전 10:00', en: 'Thu 10:00 AM' },
    location: { ko: '친교실', en: 'Fellowship Hall' },
    limit: 12,
  },
  {
    instructor: { ko: '김창환', en: 'Changhwan Kim' },
    targetGroup: { ko: '목요일 남성반', en: 'Thursday Men\'s Class' },
    timeDescription: { ko: '(목) 저녁 7:30', en: 'Thu 7:30 PM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 12,
  },
  {
    instructor: { ko: '조성희', en: 'Sunghee Jo' },
    targetGroup: { ko: '목요일 청년반 (대면)', en: 'Thursday Young Adult Class' },
    timeDescription: { ko: '(목) 저녁 7:30', en: 'Thu 7:30 PM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 15,
  },
  {
    instructor: { ko: '이근영', en: 'Keunyoung Lee' },
    targetGroup: { ko: '목요일 대학부 (대면)', en: 'Thursday College Class (A)' },
    timeDescription: { ko: '(목) 저녁 7:00', en: 'Thu 7:00 PM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 15,
  },
  {
    instructor: { ko: '오유진', en: 'Yujin Oh' },
    targetGroup: { ko: '목요일 대학부 (대면)', en: 'Thursday College Class (B)' },
    timeDescription: { ko: '(목) 저녁 7:00', en: 'Thu 7:00 PM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 15,
  },
  {
    instructor: { ko: '정민호', en: 'Minho Jung' },
    targetGroup: { ko: '토요일 남성반', en: 'Saturday Men\'s Class' },
    timeDescription: { ko: '(토) 오전 10:00', en: 'Sat 10:00 AM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 12,
  },
  {
    instructor: { ko: '장은혜', en: 'Eunhye Jang' },
    targetGroup: { ko: '토요일 여성반', en: 'Saturday Women\'s Class' },
    timeDescription: { ko: '(토) 오전 10:00', en: 'Sat 10:00 AM' },
    location: { ko: '교육관', en: 'Education Center' },
    limit: 12,
  },
]

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seeding is disabled in production. Run this in development only.' },
      { status: 403 },
    )
  }

  const payload = await getPayload({ config })

  let created = 0
  let skipped = 0
  const createdTitles: string[] = []

  // 1. Seed Coffee Break Groups
  for (const group of coffeeBreakGroups) {
    const titleKo = '커피브레이크'
    const titleEn = 'Coffee Break'
    const semesterKo = '2026 상반기'
    const semesterEn = '2026 Spring'

    const existing = await payload.find({
      collection: 'bible-studies',
      where: {
        and: [
          { courseType: { equals: 'coffee-break' } },
          { 'instructor.ko': { equals: group.instructor.ko } },
          { 'targetGroup.ko': { equals: group.targetGroup.ko } },
        ],
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      skipped += 1
      continue
    }

    const data = {
      courseType: 'coffee-break',
      semester: { ko: semesterKo, en: semesterEn },
      title: { ko: titleKo, en: titleEn },
      targetGroup: group.targetGroup,
      startDate: new Date('2026-09-07').toISOString(),
      timeDescription: group.timeDescription,
      location: group.location,
      instructor: group.instructor,
      limit: group.limit,
      status: 'active',
    }

    await payload.create({
      collection: 'bible-studies',
      data: data as any,
    })
    created += 1
    createdTitles.push(`${semesterKo} - ${titleKo} - ${group.instructor.ko}`)
  }

  // 2. Seed Panorama (New Testament and Old Testament classes)
  const panoramaGroups = [
    {
      targetGroup: { ko: '신약반 (New Testament)', en: 'New Testament Class' },
      instructor: { ko: '김정길 목사', en: 'Pastor Junggil Kim' },
      timeDescription: { ko: '매주 토요일 오전 10시', en: 'Every Saturday at 10 AM' },
      location: { ko: '소예배실', en: 'Small Chapel' },
    },
    {
      targetGroup: { ko: '구약반 (Old Testament)', en: 'Old Testament Class' },
      instructor: { ko: '김정길 목사', en: 'Pastor Junggil Kim' },
      timeDescription: { ko: '매주 토요일 오전 10시', en: 'Every Saturday at 10 AM' },
      location: { ko: '교육관 201호', en: 'Room 201' },
    },
  ]

  for (const group of panoramaGroups) {
    const existing = await payload.find({
      collection: 'bible-studies',
      where: {
        and: [
          { courseType: { equals: 'panorama' } },
          { 'targetGroup.ko': { equals: group.targetGroup.ko } },
        ],
      },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'bible-studies',
        data: {
          courseType: 'panorama',
          semester: { ko: '2026 상반기', en: '2026 Spring' },
          title: { ko: '신구약 맥잡기', en: 'Bible Panorama' },
          targetGroup: group.targetGroup,
          startDate: new Date('2026-09-05').toISOString(),
          timeDescription: group.timeDescription,
          location: group.location,
          instructor: group.instructor,
          limit: 30,
          status: 'active',
        } as any,
      })
      created += 1
      createdTitles.push(`2026 상반기 - 신구약 맥잡기 - ${group.targetGroup.ko}`)
    } else {
      skipped += 1
    }
  }

  // 3. Seed Crown Finance
  const crownExisting = await payload.find({
    collection: 'bible-studies',
    where: { courseType: { equals: 'crown' } },
    limit: 1,
  })
  if (crownExisting.docs.length === 0) {
    await payload.create({
      collection: 'bible-studies',
      data: {
        courseType: 'crown',
        semester: { ko: '2026 상반기', en: '2026 Spring' },
        title: { ko: '크라운 재정교실', en: 'Crown Financial Class' },
        targetGroup: { ko: '일반반', en: 'General Class' },
        startDate: new Date('2026-10-04').toISOString(),
        timeDescription: { ko: '매주 주일 오후 2시', en: 'Every Sunday at 2:00 PM' },
        location: { ko: '302호 세미나실', en: 'Room 302 Seminar Room' },
        instructor: { ko: '박재민 집사', en: 'Deacon Jaemin Park' },
        limit: 15,
        status: 'active',
      } as any,
    })
    created += 1
    createdTitles.push('2026 상반기 - 크라운 재정교실')
  } else {
    skipped += 1
  }

  return NextResponse.json({
    message: 'Bible studies seed complete',
    created,
    skipped,
    createdTitles,
  })
}
