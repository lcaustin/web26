import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

async function verifyTurnstile(request: Request, token: unknown) {
  const secret = process.env.TURNSTILE_SECRET
  const hostnames = new Set((process.env.TURNSTILE_HOSTNAMES || '').split(',').map((value) => value.trim()).filter(Boolean))
  if (!secret || typeof token !== 'string' || token.length === 0 || token.length > 2048 || !hostnames.size) return false
  const body = new URLSearchParams({ secret, response: token })
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) body.set('remoteip', forwarded)
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, signal: AbortSignal.timeout(10_000) })
    const result = await response.json() as { success?: boolean; action?: string; hostname?: string }
    return response.ok && result.success === true && result.action === 'room-reservation' && typeof result.hostname === 'string' && hostnames.has(result.hostname)
  } catch { return false }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!(await verifyTurnstile(request, body.turnstileToken))) return NextResponse.json({ error: 'Spam verification failed.' }, { status: 403 })
    const payload = await getPayload({ config })
    const data = {
      room: body.room,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      name: body.name,
      purpose: body.purpose,
      email: body.email,
      phone: body.phone,
      status: 'waiting' as const,
      repeatRule: 'none' as const,
    }
    const doc = await payload.create({ collection: 'room-reservations', data })
    return NextResponse.json({ id: doc.id }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit reservation'
    const conflict = /already booked|open reservation/i.test(message)
    return NextResponse.json({ error: message }, { status: conflict ? 409 : 400 })
  }
}

export async function DELETE(request: Request) {
  const payload = await getPayload({ config })
  const user = await payload.auth({ headers: request.headers })
  if (!user.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(request.url)
  const ids = [...url.searchParams.entries()]
    .filter(([key]) => /where.*id.*in/.test(key))
    .map(([, value]) => value)
  if (!ids.length) return NextResponse.json({ error: 'No reservation IDs provided.' }, { status: 400 })
  for (const id of ids) await payload.delete({ collection: 'room-reservations', id, overrideAccess: true })
  return NextResponse.json({ deleted: ids.length })
}
