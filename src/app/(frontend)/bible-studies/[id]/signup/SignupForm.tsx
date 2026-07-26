'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type SignupFormProps = {
  studyId: string
  studyTitleKo: string
  studyTitleEn?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          action: string
          callback: (token: string) => void
          'expired-callback': () => void
          'error-callback': () => void
        },
      ) => string
      reset: (widgetId: string) => void
    }
  }
}

export default function SignupForm({ studyId, studyTitleKo, studyTitleEn }: SignupFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const turnstileRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetId = useRef<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const renderTurnstile = () => {
    if (!siteKey || !turnstileRef.current || turnstileWidgetId.current || !window.turnstile) {
      return
    }

    turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      action: 'bible-study-signup',
      callback: (token: string) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
      'error-callback': () => setTurnstileToken(''),
    })
  }

  const resetTurnstile = () => {
    setTurnstileToken('')
    if (turnstileWidgetId.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current)
    }
  }

  useEffect(() => {
    renderTurnstile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!turnstileToken) {
      setErrorMessage('스팸 방지 확인을 완료해 주세요. · Please complete the spam protection check.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/bible-studies/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bibleStudyId: studyId,
          name,
          email,
          phone,
          notes,
          turnstileToken,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'registration failed')
      }

      setSuccessMessage('신청이 성공적으로 완료되었습니다! 담당자가 확인 후 연락드리겠습니다. · Registration submitted successfully! We will contact you soon.')
      setName('')
      setEmail('')
      setPhone('')
      setNotes('')
      resetTurnstile()
    } catch (err: any) {
      setErrorMessage(
        err.message === 'Spam protection failed'
          ? '스팸 방지 확인에 실패했습니다. 다시 시도해 주세요. · Spam protection failed. Please try again.'
          : err.message === 'Registration is full for this bible study class'
            ? '해당 강좌의 정원이 모두 찼습니다. · This bible study class is full.'
            : '신청 중 오류가 발생했습니다. 다시 시도해 주세요. · An error occurred. Please try again.'
      )
      resetTurnstile()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successMessage) {
    return (
      <div
        className="p-8 rounded-2xl border text-center my-8"
        style={{
          background: 'var(--surf)',
          borderColor: 'var(--bdr)',
        }}
      >
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          <i className="ti ti-circle-check" />
        </div>
        <h3 className="text-xl font-bold mb-4 text-[var(--t1)]">등록 완료 · Registration Successful</h3>
        <p className="text-[var(--t2)] mb-8 max-w-md mx-auto leading-relaxed">{successMessage}</p>
        <Link
          href="/bible-studies"
          className="inline-block px-8 py-3 rounded-full font-bold transition-colors"
          style={{
            background: 'var(--gld)',
            color: 'var(--surf)',
          }}
        >
          목록으로 돌아가기 · Back to List
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 rounded-2xl border space-y-6 my-8"
      style={{
        background: 'var(--surf)',
        borderColor: 'var(--bdr)',
      }}
    >
      <h3 className="text-lg font-bold border-b border-[var(--bdr)] pb-4 text-[var(--t1)]">
        신청서 작성 · Fill Registration Form
      </h3>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--t1)]" htmlFor="name">
          이름 · Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="성함을 입력하세요 (Your name)"
          className="w-full px-4 py-3 rounded-xl border bg-transparent focus:outline-none transition-colors"
          style={{
            borderColor: 'var(--bdr2)',
            color: 'var(--t1)',
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--t1)]" htmlFor="phone">
          전화번호 · Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="000-000-0000"
          className="w-full px-4 py-3 rounded-xl border bg-transparent focus:outline-none transition-colors"
          style={{
            borderColor: 'var(--bdr2)',
            color: 'var(--t1)',
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--t1)]" htmlFor="email">
          이메일 · Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          className="w-full px-4 py-3 rounded-xl border bg-transparent focus:outline-none transition-colors"
          style={{
            borderColor: 'var(--bdr2)',
            color: 'var(--t1)',
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--t1)]" htmlFor="notes">
          건의사항 및 메모 · Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="문의사항 또는 하시고 싶은 말씀을 적어주세요 (Any special requests or notes)"
          className="w-full px-4 py-3 rounded-xl border bg-transparent focus:outline-none transition-colors"
          style={{
            borderColor: 'var(--bdr2)',
            color: 'var(--t1)',
          }}
        />
      </div>

      <div>
        {siteKey ? (
          <>
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
              strategy="afterInteractive"
              onLoad={renderTurnstile}
            />
            <div ref={turnstileRef} />
          </>
        ) : (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            Spam protection is not configured. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY.
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !turnstileToken}
          className="w-full py-4 rounded-full font-bold transition-all text-center flex items-center justify-center gap-2"
          style={{
            background: 'var(--gld)',
            color: 'var(--surf)',
            opacity: isSubmitting || !turnstileToken ? 0.7 : 1,
          }}
        >
          {isSubmitting ? (
            <>
              <i className="ti ti-loader animate-spin" />
              신청 중... · Submitting...
            </>
          ) : (
            '신청 완료하기 · Complete Signup'
          )}
        </button>
      </div>
    </form>
  )
}
