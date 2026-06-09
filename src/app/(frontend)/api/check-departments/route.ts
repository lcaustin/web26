import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@/payload.config'

// One-time helper route to inspect what's actually in the `departments`
// collection right now — useful for confirming whether records that "look
// gone" in the admin list are actually missing, or just have an empty
// `adminTitle` (the hidden field used for `useAsTitle`, which only gets
// populated when a document is re-saved). Visit /api/check-departments once,
// then feel free to delete this route file.
// Disabled in production builds as a safety guard.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This check is disabled in production. Run it in development only.' },
      { status: 403 },
    )
  }

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'departments',
    limit: 100,
    depth: 0,
    sort: 'order',
  })

  const departments = result.docs.map((d: Record<string, unknown>) => ({
    id: d.id,
    adminTitle: d.adminTitle,
    name: d.name,
    order: d.order,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }))

  return NextResponse.json({
    message: `Found ${departments.length} department record(s) in the database.`,
    count: departments.length,
    departments,
  })
}
