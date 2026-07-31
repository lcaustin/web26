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
        const today = new Date(); today.setUTCHours(0, 0, 0, 0)
        const existing = await req.payload.find({ collection: 'room-reservations', where: { and: [{ email: { equals: data.email } }, { status: { in: activeStatuses } }, { date: { greater_than_equal: today.toISOString() } }] }, limit: 1 })
        if (existing.totalDocs) throw new Error('This requester already has an open reservation.')
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
        const body = `<p>${room?.nameKo || ''} (${room?.nameEn || ''})</p><p>Date: ${date}<br>Time: ${doc.startTime} ~ ${doc.endTime}</p><p>${doc.name}<br>${doc.email}<br>${doc.phone}</p><p>${doc.purpose || ''}</p>${operation === 'create' && doc.approvalToken ? `<p><a href="${process.env.NEXT_PUBLIC_SERVER_URL || 'https://2026.lcaustin.org'}/api/room-reservations/approve?token=${encodeURIComponent(doc.approvalToken)}">Approve reservation</a></p>` : ''}`
        const settings = await req.payload.findGlobal({ slug: 'site-settings' }).catch(() => null)
        const adminEmail = settings?.reservations?.adminEmail || process.env.RESERVATION_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL
        await req.payload.sendEmail({ to: adminEmail, subject: operation === 'create' ? `New reservation request: ${date}` : `Reservation ${doc.status}: ${date}`, html: body })
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
