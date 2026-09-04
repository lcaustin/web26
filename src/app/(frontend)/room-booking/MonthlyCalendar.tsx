'use client'

import { useMemo, useState } from 'react'

type Booking = { id: string | number; date: string; startTime: string; endTime: string; purpose: string; room?: { roomNumber?: number; nameKo?: string; nameEn?: string } | string; repeatRule?: string; repeatUntil?: string }

function key(date: Date) { return date.toISOString().slice(0, 10) }
function daysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }

export default function MonthlyCalendar({ bookings }: { bookings: Booking[] }) {
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [view, setView] = useState<'month' | 'week'>('month')
  const year = cursor.getFullYear(); const month = cursor.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const totalDays = daysInMonth(year, month)
  const monthCells = Array.from({ length: Math.ceil((firstWeekday + totalDays) / 7) * 7 }, (_, index) => {
    const day = index - firstWeekday + 1
    return day > 0 && day <= totalDays ? new Date(year, month, day) : null
  })
  const weekStart = new Date(cursor); weekStart.setDate(cursor.getDate() - cursor.getDay())
  const cells = view === 'month' ? monthCells : Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setDate(weekStart.getDate() + index); return date })
  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const booking of bookings) {
      const start = new Date(`${booking.date.slice(0, 10)}T12:00:00`)
      const until = booking.repeatUntil ? new Date(`${booking.repeatUntil.slice(0, 10)}T12:00:00`) : start
      const add = (date: Date) => { const k = key(date); const list = map.get(k) || []; list.push(booking); map.set(k, list) }
      if (!booking.repeatRule) add(start)
      else for (let d = new Date(start); d <= until; d.setDate(d.getDate() + (booking.repeatRule === 'weekly' ? 7 : 1))) {
        if (booking.repeatRule === 'monthly' && d.getDate() !== start.getDate()) continue
        add(new Date(d))
      }
    }
    return map
  }, [bookings])
  const move = (amount: number) => setCursor(view === 'month' ? new Date(year, month + amount, 1) : new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + amount * 7))
  return <div className="monthly-calendar"><div className="monthly-calendar-toolbar"><button type="button" onClick={() => move(-1)} aria-label="Previous">‹</button><h3>{view === 'month' ? cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}</h3><button type="button" onClick={() => move(1)} aria-label="Next">›</button><div className="monthly-calendar-view-toggle"><button type="button" className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>Month</button><button type="button" className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Week</button></div></div><div className="monthly-calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div><div className={`monthly-calendar-grid ${view === 'week' ? 'monthly-calendar-grid--week' : ''}`}>{cells.map((date, index) => <div className="monthly-calendar-day" key={date ? key(date) : `empty-${index}`}>{date && <><time>{date.getDate()}</time>{(byDate.get(key(date)) || []).map((booking, eventIndex) => { const room = typeof booking.room === 'object' ? `${booking.room.roomNumber ? `${booking.room.roomNumber} ` : ''}${booking.room.nameKo || ''}${booking.room.nameEn && booking.room.nameEn !== booking.room.nameKo ? ` · ${booking.room.nameEn}` : ''}` : ''; return <div className="monthly-calendar-purpose" key={`${booking.id}-${eventIndex}`}><strong>{booking.purpose}</strong><span>{booking.startTime}–{booking.endTime}</span>{room && <span>{room}</span>}</div> })}</>}</div>)}</div></div>
}
