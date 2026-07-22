import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import { isNewsCategory } from '@/lib/news-categories'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() || ''
  const categoryParam = request.nextUrl.searchParams.get('category') || ''
  const category = isNewsCategory(categoryParam) ? categoryParam : ''
  const requestedPage = Number.parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
  const requestedLimit = Number.parseInt(request.nextUrl.searchParams.get('limit') || '10', 10)
  const limit = requestedLimit === 15 ? 15 : 10
  const filters: Where[] = []
  if (category) filters.push({ category: { equals: category } })
  if (query) filters.push({ or: [{ 'title.ko': { contains: query } }, { 'title.en': { contains: query } }, { adminTitle: { contains: query } }] })
  const where: Where | undefined = filters.length > 1 ? { and: filters } : filters[0]
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'news', limit, page, sort: '-date', ...(where ? { where } : {}) })
  return NextResponse.json({ docs: result.docs.map((item: any) => ({ id: item.id, slug: item.slug, title: item.title, date: item.date, category: item.category, link: item.link })), page: result.page, totalPages: result.totalPages, totalDocs: result.totalDocs })
}
