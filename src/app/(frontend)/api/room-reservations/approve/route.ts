import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return new NextResponse('Missing approval token', { status: 400 })
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'room-reservations', where: { approvalToken: { equals: token } }, limit: 1, overrideAccess: true })
  if (!result.totalDocs) return new NextResponse('This approval link is invalid or has already been used.', { status: 404 })
  const reservation = result.docs[0]
  if (reservation.status !== 'waiting') return new NextResponse('<!doctype html><title>Already processed</title><main style="font-family:system-ui;max-width:600px;margin:80px auto"><h1>Already processed</h1><p>This reservation has already been approved, rejected, or otherwise processed.</p></main>', { status: 409, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  await payload.update({ collection: 'room-reservations', id: reservation.id, data: { status: 'approved' }, overrideAccess: true })
  return new NextResponse('<!doctype html><title>Reservation approved</title><main style="font-family:system-ui;max-width:600px;margin:80px auto"><h1>Reservation approved</h1><p>The reservation has been approved successfully.</p></main>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
