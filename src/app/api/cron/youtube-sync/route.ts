import { NextRequest, NextResponse } from 'next/server'

import { syncYouTubeChannels } from '@/lib/youtube-sync'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

/** Vercel Cron endpoint. It may also be invoked manually with CRON_SECRET. */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 })
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return NextResponse.json(await syncYouTubeChannels())
  } catch (error) {
    console.error('YouTube channel sync failed', error)
    return NextResponse.json({ error: 'YouTube channel sync failed' }, { status: 500 })
  }
}
