import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@/payload.config'

// One-time helper route to populate the `departments` (다음세대) collection
// with the 8 placeholder tiles that were previously hardcoded as a frontend
// FALLBACK array (src/components/Departments.tsx) — turning them into real,
// editable CMS records. Visit /api/seed-departments once after `pnpm dev` is
// running, then feel free to delete this route file when you no longer need
// it. Skips any department whose Korean name already exists, so it's safe to
// run more than once. Disabled in production builds as a safety guard.

const departmentSeedItems = [
  { name: { ko: '영아부', en: 'Nursery' }, icon: 'ti-baby-carriage', order: 0 },
  { name: { ko: '유아부', en: 'Preschool' }, icon: 'ti-mood-kid', order: 1 },
  { name: { ko: '초등부', en: 'Elementary' }, icon: 'ti-school', order: 2 },
  { name: { ko: '중고등부', en: 'Youth' }, icon: 'ti-backpack', order: 3 },
  { name: { ko: '대학청년부', en: 'College & Young Adult' }, icon: 'ti-users', order: 4 },
  { name: { ko: 'EM', en: 'English Ministry' }, icon: 'ti-world', order: 5 },
  { name: { ko: '에노스', en: 'Enos (Senior)' }, icon: 'ti-user-circle', order: 6 },
  { name: { ko: '가온학교', en: 'Gaon School' }, icon: 'ti-book', order: 7 },
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
  const createdNames: string[] = []
  const skippedNames: string[] = []

  for (const item of departmentSeedItems) {
    const existing = await payload.find({
      collection: 'departments',
      where: { 'name.ko': { equals: item.name.ko } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      skipped += 1
      skippedNames.push(item.name.ko)
      continue
    }

    await payload.create({
      collection: 'departments',
      data: item,
    })
    created += 1
    createdNames.push(item.name.ko)
  }

  return NextResponse.json({
    message: '다음세대 (departments) seed complete',
    created,
    skipped,
    createdNames,
    skippedNames,
  })
}
