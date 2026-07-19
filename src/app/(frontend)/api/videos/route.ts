import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function textWhere(keyword: string): Where {
  const compactKeyword = keyword.replace(/\s/g, '')
  const terms = Array.from(new Set([keyword, compactKeyword].filter(Boolean)))
  return { or: terms.flatMap((term) => [
    { adminTitle: { contains: term } },
    { titleEn: { contains: term } },
    { tags: { contains: term } },
    { description: { contains: term } },
  ]) as unknown as Where[] }
}

function legacyCategoryWhere(category: string): Where | undefined {
  if (['sermon', 'worship', 'choir', 'offering-song'].includes(category)) return { category: { equals: category } }
  if (category === 'testimony') return textWhere('간증')
  if (category === 'event') return textWhere('행사')
  if (category === 'education') return { or: [{ category: { equals: 'ministry' } }, textWhere('교육부')] }
  return undefined
}

/** Lightweight public endpoint used to append video tiles on small screens. */
export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category') || ''
  const query = request.nextUrl.searchParams.get('q')?.trim() || ''
  const requestedPage = Number.parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
  const requestedLimit = Number.parseInt(request.nextUrl.searchParams.get('limit') || '15', 10)
  const limit = requestedLimit === 10 ? 10 : 15
  const filters = [legacyCategoryWhere(category), query ? textWhere(query) : undefined].filter(Boolean) as Where[]
  const where: Where | undefined = filters.length > 1 ? { and: filters } : filters[0]
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'videos',
    limit,
    page,
    sort: '-publishedAt',
    ...(where ? { where } : {}),
  })

  return NextResponse.json({
    docs: result.docs.map((video: any) => ({
      id: video.id,
      title: { ko: video.adminTitle, en: video.titleEn },
      date: video.publishedAt,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
    })),
    page: result.page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
  })
}
