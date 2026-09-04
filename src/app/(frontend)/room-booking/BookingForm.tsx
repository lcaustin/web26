'use client'
import { useRef, useState } from 'react'
import Script from 'next/script'

export default function BookingForm({ rooms }: { rooms: any[] }) {
  const roomLabel = (room: any) => `${room.roomNumber ?? ''}${room.roomNumber ? ' ' : ''}${room.nameKo}${room.nameEn && room.nameEn !== room.nameKo ? ` · ${room.nameEn}` : ''}`
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [pendingData, setPendingData] = useState<Record<string, string> | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); formRef.current = event.currentTarget; setBusy(false); setMessage('')
    if (!turnstileToken) { setBusy(false); setMessage('스팸 방지 확인을 완료해 주세요. · Please complete the spam protection check.'); return }
    const data: Record<string, string> = { ...Object.fromEntries(new FormData(event.currentTarget).entries()), turnstileToken } as Record<string, string>
    setPendingData(data)
  }
  async function confirmSubmit() {
    if (!pendingData) return
    setBusy(true); setPendingData(null)
    const response = await fetch('/api/room-reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pendingData) })
    const result = await response.json(); setBusy(false)
    if (!response.ok) { setMessage(result.error || '예약 요청을 제출하지 못했습니다.'); return }
    formRef.current?.reset(); setTurnstileToken(''); setMessage('예약 요청이 접수되었습니다. 관리자 승인 이메일을 기다려 주세요.')
  }
  return <><form onSubmit={submit} className="form-grid" style={{ maxWidth: 720 }}>
    <label>공간 <select name="room" required defaultValue=""><option value="" disabled>선택하세요</option>{rooms.map(room => <option key={room.id} value={room.id}>{roomLabel(room)}</option>)}</select></label>
    <label>날짜 <input name="date" type="date" required min={new Date().toISOString().slice(0, 10)} /></label>
    <div className="form-row"><label>시작 시간 <input name="startTime" type="time" required /></label><label>종료 시간 <input name="endTime" type="time" required /></label></div>
    <label>신청자 이름 <input name="name" required /></label><label>목적 <input name="purpose" required placeholder="예) 행복구역 구역모임" /></label>
    <label>이메일 <input name="email" type="email" required /></label><label>전화번호 <input name="phone" type="tel" required /></label>
    {siteKey ? <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => { const container = document.getElementById('room-booking-turnstile'); if (container && window.turnstile) window.turnstile.render(container, { sitekey: siteKey, action: 'room-reservation', callback: setTurnstileToken, 'expired-callback': () => setTurnstileToken(''), 'error-callback': () => setTurnstileToken('') }) }} /><div id="room-booking-turnstile" /></> : <p role="alert">Spam protection is not configured.</p>}
    <button type="submit" disabled={busy || !turnstileToken}>{busy ? '제출 중…' : '예약 요청 · Request booking'}</button>{message && <p role="status">{message}</p>}
  </form>{pendingData && <div className="booking-confirm-backdrop" role="presentation"><div className="booking-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="booking-confirm-title"><h2 id="booking-confirm-title">예약 내용을 확인해 주세요</h2><dl><div><dt>장소 · Room</dt><dd>{rooms.find((room) => String(room.id) === pendingData.room)?.nameKo || pendingData.room}</dd></div><div><dt>날짜 · Date</dt><dd>{pendingData.date}</dd></div><div><dt>시간 · Time</dt><dd>{pendingData.startTime} ~ {pendingData.endTime}</dd></div><div><dt>신청자 · Name</dt><dd>{pendingData.name}</dd></div><div><dt>목적 · Purpose</dt><dd>{pendingData.purpose}</dd></div><div><dt>이메일 · Email</dt><dd>{pendingData.email}</dd></div><div><dt>전화번호 · Phone</dt><dd>{pendingData.phone}</dd></div></dl><div className="booking-confirm-actions"><button type="button" onClick={() => setPendingData(null)}>취소 · Cancel</button><button type="button" onClick={confirmSubmit} disabled={busy}>{busy ? '제출 중…' : '확인 후 제출 · Submit'}</button></div></div></div>}</>
}
