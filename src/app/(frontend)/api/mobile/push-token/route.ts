import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@/payload.config'
import { getMobileUser } from '@/lib/mobileAuth'
import { subscribeToTopic, unsubscribeFromTopic } from '@/lib/firebaseAdmin'
import { handleOptions, withCors } from '@/lib/cors'
import { NOTIFICATION_TOPICS, type NotificationTopic } from '@/lib/notificationTopics'

export function OPTIONS(request: Request) {
  return handleOptions(request)
}

// Called after native push permission is granted and whenever a user changes
// notification preferences. Device records hold only delivery tokens; all
// tokens for a user follow the user's single notification-preferences array.
export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    const user = await getMobileUser(payload, request.headers)

    if (!user) {
      return withCors(request, NextResponse.json({ message: 'Unauthorized' }, { status: 401 }))
    }

    const { token, platform } = await request.json().catch(() => ({}))

    if (!token || !platform) {
      return withCors(
        request,
        NextResponse.json({ message: 'token and platform are required' }, { status: 400 }),
      )
    }

    const existing = await payload.find({
      collection: 'device-tokens',
      where: { token: { equals: token } },
      limit: 1,
    })

    if (existing.docs[0]) {
      await payload.update({
        collection: 'device-tokens',
        id: existing.docs[0].id,
        data: { user: user.id, platform },
      })
    } else {
      await payload.create({
        collection: 'device-tokens',
        data: { user: user.id, token, platform },
      })
    }

    const rawPreferences: unknown[] = Array.isArray(user.notificationPreferences)
      ? user.notificationPreferences
      : []
    const preferences = rawPreferences.filter(
      (topic: unknown): topic is NotificationTopic =>
        NOTIFICATION_TOPICS.includes(topic as NotificationTopic),
    )
    const userDevices = await payload.find({
      collection: 'device-tokens',
      where: { user: { equals: user.id } },
      limit: 100,
    })

    await Promise.all(userDevices.docs.flatMap((device) => [
      ...NOTIFICATION_TOPICS.filter((topic) => !preferences.includes(topic)).map((topic) => unsubscribeFromTopic(device.token, topic)),
      ...preferences.map((topic) => subscribeToTopic(device.token, topic)),
    ]))

    return withCors(request, NextResponse.json({ ok: true }))
  } catch (err: any) {
    console.error('push-token error:', err)
    return withCors(
      request,
      NextResponse.json(
        { message: 'Internal error', error: String(err?.message || err) },
        { status: 500 },
      ),
    )
  }
}
