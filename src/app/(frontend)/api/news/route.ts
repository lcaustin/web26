import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() || ''
  const requestedPage = Number.parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
  const requestedLimit = Number.parseInt(request.nextUrl.searchParams.get('limit') || '10', 10)
  const limit = requestedLimit === 15 ? 15 : 10
  const where: Where | undefined = query ? { or: [{ 'title.ko': { contains: query } }, { 'title.en': { contains: query } }, { adminTitle: { contains: query } }] } : undefined
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'news', limit, page, sort: '-date', ...(where ? { where } : {}) })
  return NextResponse.json({ docs: result.docs.map((item: any) => ({ id: item.id, slug: item.slug, title: item.title, date: item.date, link: item.link })), page: result.page, totalPages: result.totalPages, totalDocs: result.totalDocs })
}
