import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Lightweight public endpoint used to append video tiles on small screens. */
export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category')
  const requestedPage = Number.parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'videos',
    limit: 15,
    page,
    sort: '-publishedAt',
    ...(category ? { where: { category: { equals: category } } } : {}),
  })

  return NextResponse.json({
    docs: result.docs.map((video: any) => ({
      id: video.id,
      title: { ko: video.adminTitle, en: '' },
      date: video.publishedAt,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
    })),
    page: result.page,
    totalPages: result.totalPages,
  })
}
