import type { CollectionConfig } from 'payload'
import crypto from 'node:crypto'

const DEFAULT_ADMIN_EMAIL = 'reservation@lcaustin.org'
const activeStatuses = ['waiting', 'approved']

export const RoomReservations: CollectionConfig = {
  slug: 'room-reservations',
  admin: { useAsTitle: 'adminTitle', defaultColumns: ['date', 'room', 'purpose', 'name', 'status', 'createdAt'], pagination: { defaultLimit: 50 } },
  access: { read: ({ req }) => Boolean(req.user?.isAdmin), create: () => true, update: ({ req }) => Boolean(req.user?.isAdmin), delete: ({ req }) => Boolean(req.user?.isAdmin) },
  hooks: {
    beforeValidate: [({ data }) => {
      if (data && typeof data.room === 'string' && /^\d+$/.test(data.room)) data.room = Number(data.room)
      return data
    }],
    beforeChange: [async ({ data, req, operation }) => {
      if (!data) return data
      if (operation === 'create') {
        data.approvalToken = crypto.randomBytes(32).toString('hex')
        const roomId = typeof data.room === 'object' ? data.room.id : data.room
        const dayStart = new Date(`${String(data.date).slice(0, 10)}T00:00:00.000Z`).toISOString()
        const dayEnd = new Date(`${String(data.date).slice(0, 10)}T23:59:59.999Z`).toISOString()
        const conflict = await req.payload.find({ collection: 'room-reservations', where: { and: [{ room: { equals: roomId } }, { date: { greater_than_equal: dayStart } }, { date: { less_than_equal: dayEnd } }, { status: { in: activeStatuses } }, { startTime: { less_than: data.endTime } }, { endTime: { greater_than: data.startTime } }] }, limit: 1 })
        if (conflict.totalDocs) throw new Error('This room is already booked during that time.')
      }
      data.adminTitle = `${data.date} - ${data.name || 'Reservation'}`
      return data
    }],
    afterChange: [async ({ doc, previousDoc, operation, req }) => {
      if (!doc || !doc.room) return doc
      if (operation === 'create' || (operation === 'update' && previousDoc?.status !== doc.status)) {
        const room = typeof doc.room === 'object' ? doc.room : await req.payload.findByID({ collection: 'rooms', id: doc.room })
        const date = String(doc.date).slice(0, 10)
        const roomNumber = room?.roomNumber ? `${room.roomNumber} ` : ''
        const roomName = `${roomNumber}${room?.nameKo || ''}${room?.nameEn && room.nameEn !== room.nameKo ? ` ${room.nameEn}` : ''}`
        const directoryUrl = `${(process.env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')}/uploads/image/lc-directory.jpg`
        const body = `<p><strong>Room name:</strong> ${roomName}</p><p><strong>Date:</strong> ${date}<br><strong>Time:</strong> ${doc.startTime} ~ ${doc.endTime}</p><p><strong>Requester name:</strong> ${doc.name}<br><strong>Requester email:</strong> ${doc.email}<br><strong>Requester phone:</strong> ${doc.phone}</p><p><strong>Purpose:</strong> ${doc.purpose || ''}</p>${operation === 'create' && doc.approvalToken ? `<p><a href="${process.env.NEXT_PUBLIC_SERVER_URL || 'https://2026.lcaustin.org'}/api/room-reservations/approve?token=${encodeURIComponent(doc.approvalToken)}">Approve reservation</a></p>` : ''}<p><a href="${directoryUrl}">View building directory · 교회 건물 안내</a></p>`
        const settings = await req.payload.findGlobal({ slug: 'site-settings' }).catch(() => null)
        const configuredEmails = String(settings?.reservations?.adminEmail || process.env.RESERVATION_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).split(/[\s,;]+/).map((email) => email.trim()).filter(Boolean)
        await req.payload.sendEmail({ to: configuredEmails, subject: operation === 'create' ? `New reservation request: ${date}` : `Reservation ${doc.status}: ${date}`, html: body })
        if (operation !== 'create' && doc.email) await req.payload.sendEmail({ to: doc.email, subject: `Room reservation ${doc.status}: ${date}`, html: body })
      }
      return doc
    }],
  },
  fields: [
    { name: 'adminTitle', type: 'text', admin: { hidden: true } },
    { name: 'room', type: 'relationship', relationTo: 'rooms', required: true },
    { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'startTime', type: 'text', required: true, label: 'Start time', admin: { components: { Field: '/components/admin/TimeField#default' } } },
    { name: 'endTime', type: 'text', required: true, label: 'End time', admin: { components: { Field: '/components/admin/TimeField#default' } } },
    { name: 'name', type: 'text', required: true },
    { name: 'purpose', type: 'textarea', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'waiting', options: [{ label: 'Waiting for approval', value: 'waiting' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }, { label: 'Deleted', value: 'deleted' }] },
    { name: 'approvalToken', type: 'text', admin: { hidden: true } },
    { name: 'repeatRule', type: 'select', label: 'Repeat reservation (Admin)', options: [{ label: 'No repeat', value: 'none' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }], defaultValue: 'none', admin: { position: 'sidebar', description: 'Only administrators can create repeatable reservations.' } },
    { name: 'repeatUntil', type: 'date', label: 'Repeat until', admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' }, condition: (_, siblingData) => siblingData?.repeatRule && siblingData.repeatRule !== 'none' } },
  ],
}
