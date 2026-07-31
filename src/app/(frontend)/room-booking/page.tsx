import config from '@payload-config'
import { getPayload } from 'payload'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import BookingForm from './BookingForm'
import MonthlyCalendar from './MonthlyCalendar'

export const dynamic = 'force-dynamic'

export default async function RoomBookingPage() {
  const payload = await getPayload({ config })
  const rooms = await payload.find({ collection: 'rooms', where: { active: { equals: true } }, sort: 'order', limit: 100 })
  const approved = await payload.find({ collection: 'room-reservations', where: { status: { equals: 'approved' } }, sort: 'date', limit: 250, depth: 1, overrideAccess: true })
  return <><Nav /><main className="page-shell"><header className="page-header"><p className="eyebrow">시설 예약 · Facility booking</p><h1>장소 예약 <span>Room Booking</span></h1><p>사용할 날짜와 시간을 선택해 예약을 요청해 주세요. 관리자 승인 후 확정됩니다.</p></header><section aria-labelledby="booking-calendar-title" className="mb-10"><h2 id="booking-calendar-title">예약 일정 · Booking Calendar</h2><MonthlyCalendar bookings={approved.docs as any[]} /></section><BookingForm rooms={rooms.docs as any[]} /></main><Footer /></>
}
