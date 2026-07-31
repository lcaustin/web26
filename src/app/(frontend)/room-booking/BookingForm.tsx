'use client'
import { useState } from 'react'
import Script from 'next/script'

export default function BookingForm({ rooms }: { rooms: any[] }) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setMessage('')
    if (!turnstileToken) { setBusy(false); setMessage('스팸 방지 확인을 완료해 주세요. · Please complete the spam protection check.'); return }
    const data: Record<string, string> = { ...Object.fromEntries(new FormData(event.currentTarget).entries()), turnstileToken } as Record<string, string>
    const confirmed = window.confirm(`Reservation summary\n\nRoom: ${data.room}\nDate: ${data.date}\nTime: ${data.startTime} ~ ${data.endTime}\nName: ${data.name}\nPurpose: ${data.purpose}\nEmail: ${data.email}\nPhone: ${data.phone}\n\nSubmit this reservation?`)
    if (!confirmed) { setBusy(false); return }
    const response = await fetch('/api/room-reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const result = await response.json(); setBusy(false)
    if (!response.ok) { setMessage(result.error || '예약 요청을 제출하지 못했습니다.'); return }
    form.reset(); setTurnstileToken(''); setMessage('예약 요청이 접수되었습니다. 관리자 승인 이메일을 기다려 주세요.')
  }
  return <form onSubmit={submit} className="form-grid" style={{ maxWidth: 720 }}>
    <label>공간 <select name="room" required defaultValue=""><option value="" disabled>선택하세요</option>{rooms.map(room => <option key={room.id} value={room.id}>{room.nameKo} · {room.nameEn}</option>)}</select></label>
    <label>날짜 <input name="date" type="date" required min={new Date().toISOString().slice(0, 10)} /></label>
    <div className="form-row"><label>시작 시간 <input name="startTime" type="time" required /></label><label>종료 시간 <input name="endTime" type="time" required /></label></div>
    <label>신청자 이름 <input name="name" required /></label><label>목적 <textarea name="purpose" required rows={3} /></label>
    <label>이메일 <input name="email" type="email" required /></label><label>전화번호 <input name="phone" type="tel" required /></label>
    {siteKey ? <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => { const container = document.getElementById('room-booking-turnstile'); if (container && window.turnstile) window.turnstile.render(container, { sitekey: siteKey, action: 'room-reservation', callback: setTurnstileToken, 'expired-callback': () => setTurnstileToken(''), 'error-callback': () => setTurnstileToken('') }) }} /><div id="room-booking-turnstile" /></> : <p role="alert">Spam protection is not configured.</p>}
    <button type="submit" disabled={busy || !turnstileToken}>{busy ? '제출 중…' : '예약 요청 · Request booking'}</button>{message && <p role="status">{message}</p>}
  </form>
}
