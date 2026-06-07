import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@/payload.config'
import { newsSeedItems } from '@/seed/news-data'

// One-time helper route to populate the `news` (소식) collection with sample
// announcements. Visit /api/seed-news once after `pnpm dev` is running, then
// feel free to delete this route file (and src/seed/) when you no longer
// need it. Disabled in production builds as a safety guard.
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

  for (const item of newsSeedItems) {
    const existing = await payload.find({
      collection: 'news',
      where: { 'title.ko': { equals: item.title.ko } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      skipped += 1
      continue
    }

    await payload.create({
      collection: 'news',
      data: item,
    })
    created += 1
    createdTitles.push(item.title.ko)
  }

  return NextResponse.json({
    message: `소식 (news) seed complete`,
    created,
    skipped,
    createdTitles,
  })
}
