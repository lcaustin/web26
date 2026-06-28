import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@/payload.config'
import { getMobileUser } from '@/lib/mobileAuth'
import { subscribeToTopic, unsubscribeFromTopic } from '@/lib/firebaseAdmin'
import { handleOptions, withCors } from '@/lib/cors'

export function OPTIONS(request: Request) {
  return handleOptions(request)
}

// Called by the mobile app right after push permission is granted (sign-in,
// sign-up, or any time notification preferences change). Upserts a
// device-tokens doc for this token and reconciles FCM topic subscriptions to
// match the `topics` list the app sent.
export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const user = await getMobileUser(payload, request.headers)

  if (!user) {
    return withCors(request, NextResponse.json({ message: 'Unauthorized' }, { status: 401 }))
  }

  const { token, platform, topics } = await request.json().catch(() => ({}))

  if (!token || !platform || !Array.isArray(topics)) {
    return withCors(
      request,
      NextResponse.json(
        { message: 'token, platform, and topics[] are required' },
        { status: 400 },
      ),
    )
  }

  const existing = await payload.find({
    collection: 'device-tokens',
    where: { token: { equals: token } },
    limit: 1,
  })

  const previousTopics: string[] = existing.docs[0]?.topics ?? []

  const toSubscribe = topics.filter((t: string) => !previousTopics.includes(t))
  const toUnsubscribe = previousTopics.filter((t) => !topics.includes(t))

  await Promise.all([
    ...toSubscribe.map((t: string) => subscribeToTopic(token, t)),
    ...toUnsubscribe.map((t: string) => unsubscribeFromTopic(token, t)),
  ])

  if (existing.docs[0]) {
    await payload.update({
      collection: 'device-tokens',
      id: existing.docs[0].id,
      data: { user: user.id, platform, topics },
    })
  } else {
    await payload.create({
      collection: 'device-tokens',
      data: { user: user.id, token, platform, topics },
    })
  }

  return withCors(request, NextResponse.json({ ok: true }))
}
