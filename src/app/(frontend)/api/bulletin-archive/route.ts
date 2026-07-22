import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Provides five bulletin PDFs at a time for the public archive's append action. */
export async function GET(request: NextRequest) {
  const requestedPage = Number.parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'bulletins', limit: 5, page, sort: '-issueDate' })

  return NextResponse.json({
    docs: result.docs
      .filter((bulletin: any) => Boolean(bulletin.url))
      .map((bulletin: any) => ({ id: bulletin.id, issueDate: bulletin.issueDate, url: bulletin.url })),
    page: result.page,
    totalPages: result.totalPages,
  })
}
