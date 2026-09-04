import config from '@payload-config'
import { getPayload } from 'payload'
import Footer from '@/components/Footer'
const assetBase = (process.env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')
import Nav from '@/components/Nav'
import BookingForm from './BookingForm'
import MonthlyCalendar from './MonthlyCalendar'

export const dynamic = 'force-dynamic'

export default async function RoomBookingPage() {
  const payload = await getPayload({ config })
  const rooms = await payload.find({ collection: 'rooms', where: { and: [{ active: { equals: true } }, { reservable: { equals: true } }] }, sort: 'order', limit: 100 })
  const approved = await payload.find({ collection: 'room-reservations', where: { status: { equals: 'approved' } }, sort: 'date', limit: 250, depth: 1, overrideAccess: true })
  return <><Nav /><main className="page-shell"><header className="page-header"><p className="eyebrow">시설 예약 · Facility booking</p><h1>장소 예약 <span>Room Booking</span></h1><p>사용할 날짜와 시간을 선택해 예약을 요청해 주세요. 관리자 승인 후 확정됩니다.</p></header><section aria-labelledby="booking-calendar-title" className="mb-10"><h2 id="booking-calendar-title">예약 일정 · Booking Calendar</h2><MonthlyCalendar bookings={approved.docs as any[]} /></section><BookingForm rooms={rooms.docs as any[]} /><figure className="room-directory-image"><img src={`${assetBase}/uploads/image/lc-directory.jpg`} alt="Lord's Church building directory and room map" /><figcaption>교회 건물 안내 · Building directory</figcaption></figure></main><Footer /></>
}
