import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const base = (process.env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')
const imageUrl = (url?: string | null) => !url ? null : /^https?:\/\//.test(url) ? url : base + '/' + url.replace(/^\/+/, '')

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category') || ''
  const query = request.nextUrl.searchParams.get('q')?.trim() || ''
  const requestedPage = Number.parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
  const requestedLimit = Number.parseInt(request.nextUrl.searchParams.get('limit') || '15', 10)
  const limit = requestedLimit === 10 ? 10 : 15
  const filters: Where[] = []
  if (category) filters.push({ or: [{ tags: { contains: category } }, { title: { contains: category } }] })
  if (query) filters.push({ or: [{ tags: { contains: query } }, { title: { contains: query } }] })
  const where: Where | undefined = filters.length > 1 ? { and: filters } : filters[0]
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'photo-albums', page, limit, sort: '-eventDate', ...(where ? { where } : {}) })
  return NextResponse.json({
    docs: result.docs.map((album: any) => ({ id: album.id, slug: album.slug, title: album.title, imageCount: Number(album.imageCount ?? 0), coverUrl: imageUrl(album.coverImageUrl) })),
    page: result.page,
    totalPages: result.totalPages,
  })
}
