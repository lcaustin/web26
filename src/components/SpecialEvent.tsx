'use client'

import { useEffect, useRef, useState } from 'react'

type EventItem = {
  id: string | number
  slug?: string | null
  title: { ko?: string | null; en?: string | null }
  startDate: string
  endDate: string
  link?: string | null
}

type WelcomeProps = {
  messageKo?: string | null
  messageEn?: string | null
  registerLabelKo?: string | null
  registerLabelEn?: string | null
  registerHref?: string | null
}

type Props = {
  events: EventItem[]
  welcome?: WelcomeProps
}

const WELCOME_DEFAULTS = {
  messageKo: '어스틴 주님의교회에 오신 것을 환영합니다!',
  messageEn: 'Welcome to Lord’s Church of Austin — where community and faith grow together',
  registerLabelKo: '새가족 등록 안내',
  registerLabelEn: 'New Family Registration',
  registerHref: '/register',
}

const formatDateRange = (start: string, end: string) => {
  const fmt = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }
  const s = fmt(start)
  const e = fmt(end)
  return s === e ? s : `${s} – ${e}`
}

const AUTOPLAY_MS = 4500

export default function SpecialEvent({ events, welcome = {} }: Props) {
  // Total slides = events + welcome (always last)
  const total = events.length + 1
  const hasEvents = events.length > 0
  const [index, setIndex] = useState(0)
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = (dir: 'prev' | 'next') => {
    setAnimDir(dir === 'next' ? 'left' : 'right')
    setIndex((i) => (dir === 'next' ? (i + 1) % total : (i - 1 + total) % total))
  }

  useEffect(() => {
    if (!animDir) return
    const t = setTimeout(() => setAnimDir(null), 350)
    return () => clearTimeout(t)
  }, [animDir, index])

  useEffect(() => {
    if (!hasEvents) return
    timerRef.current = setInterval(() => go('next'), AUTOPLAY_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [hasEvents, total])

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (hasEvents) timerRef.current = setInterval(() => go('next'), AUTOPLAY_MS)
  }

  const handlePrev = () => { go('prev'); resetTimer() }
  const handleNext = () => { go('next'); resetTimer() }

  const isWelcomeSlide = index === total - 1
  const ev = !isWelcomeSlide ? events[index] : null

  return (
    <div className="se-section">
      {/* Left chevron — hidden when no events */}
      {hasEvents && (
        <button type="button" className="se-chevron se-chevron--left" onClick={handlePrev} aria-label="Previous">
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>
      )}

      {/* Slide content */}
      {isWelcomeSlide ? (
        /* Welcome pane */
        <div className={`se-inner${animDir ? ` se-inner--${animDir}` : ''}`}>
          <div className="welcome-ko">
            {welcome.messageKo || WELCOME_DEFAULTS.messageKo}
          </div>
          <div className="se-divider" />
          <div className="welcome-en">
            {welcome.messageEn || WELCOME_DEFAULTS.messageEn}
          </div>
          <a
            href={welcome.registerHref || WELCOME_DEFAULTS.registerHref}
            className="welcome-link"
          >
            <i className="ti ti-user-plus" aria-hidden="true" />
            {welcome.registerLabelKo || WELCOME_DEFAULTS.registerLabelKo} ·{' '}
            {welcome.registerLabelEn || WELCOME_DEFAULTS.registerLabelEn}
          </a>
          {hasEvents && (
            <div className="se-dots" style={{ marginTop: 12 }}>
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`se-dot-btn${i === index ? ' se-dot-btn--active' : ''}`}
                  onClick={() => { setAnimDir(i > index ? 'left' : 'right'); setIndex(i); resetTimer() }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Event pane */
        <a
          href={ev!.link ?? (ev!.slug ? `/news/${ev!.slug}` : `/news/${ev!.id}`)}
          className={`se-inner${animDir ? ` se-inner--${animDir}` : ''}`}
          {...(ev!.link ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <div className="se-eyebrow">
            <i className="ti ti-calendar-event" aria-hidden="true" />
            특별 행사 · Special Event
          </div>
          <div className="se-divider" />
          <div className="se-title-ko">{ev!.title.ko}</div>
          {ev!.title.en && <div className="se-title-en">{ev!.title.en}</div>}
          <div className="se-dates">
            <i className="ti ti-clock" aria-hidden="true" />
            {formatDateRange(ev!.startDate, ev!.endDate)}
          </div>
          <div className="se-dots" style={{ marginTop: 8 }}>
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`se-dot-btn${i === index ? ' se-dot-btn--active' : ''}`}
                onClick={(e) => { e.preventDefault(); setAnimDir(i > index ? 'left' : 'right'); setIndex(i); resetTimer() }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </a>
      )}

      {/* Right chevron — hidden when no events */}
      {hasEvents && (
        <button type="button" className="se-chevron se-chevron--right" onClick={handleNext} aria-label="Next">
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
