import { NextResponse } from 'next/server'

import { sendToTopic } from '@/lib/firebaseAdmin'
import { NOTIFICATION_TOPICS } from '@/lib/notificationTopics'

// Internal/admin-triggered route for sending a push notification to everyone
// subscribed to one of the 7 ministry topics. Not called by the mobile app —
// intended to be called from a Payload hook (e.g. afterChange on News, when a
// post tagged with a department is published) or manually by staff tooling.
// Protected by a shared secret rather than end-user auth, since there's no
// admin/staff role field on Users yet.
export async function POST(request: Request) {
  const secret = request.headers.get('x-internal-secret')
  if (!process.env.MOBILE_PUSH_SECRET || secret !== process.env.MOBILE_PUSH_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { topic, title, body } = await request.json().catch(() => ({}))

  if (!topic || !title || !body) {
    return NextResponse.json({ message: 'topic, title, and body are required' }, { status: 400 })
  }

  if (!NOTIFICATION_TOPICS.includes(topic)) {
    return NextResponse.json(
      { message: `Unknown topic "${topic}". Valid topics: ${NOTIFICATION_TOPICS.join(', ')}` },
      { status: 400 },
    )
  }

  try {
    const messageId = await sendToTopic(topic, title, body)
    return NextResponse.json({ ok: true, messageId })
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to send notification' },
      { status: 500 },
    )
  }
}
