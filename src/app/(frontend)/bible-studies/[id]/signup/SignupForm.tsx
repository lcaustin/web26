'use client'

import { useState } from 'react'
import Link from 'next/link'

type SignupFormProps = {
  studyId: string
  studyTitleKo: string
  studyTitleEn?: string
}

export default function SignupForm({ studyId, studyTitleKo, studyTitleEn }: SignupFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    } catch (err: any) {
      setErrorMessage(
        err.message === 'Registration is full for this bible study class'
          ? '해당 강좌의 정원이 모두 찼습니다. · This bible study class is full.'
          : '신청 중 오류가 발생했습니다. 다시 시도해 주세요. · An error occurred. Please try again.'
      )
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
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-0000-0000 / 512-000-0000"
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

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-full font-bold transition-all text-center flex items-center justify-center gap-2"
          style={{
            background: 'var(--gld)',
            color: 'var(--surf)',
            opacity: isSubmitting ? 0.7 : 1,
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
