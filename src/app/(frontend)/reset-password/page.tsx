'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.message || data?.message || 'Reset failed.')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <p className="reset-error">
        Invalid or missing reset token. Please request a new password reset link.
      </p>
    )
  }

  if (done) {
    return (
      <p className="reset-success">
        Your password has been reset. You can now sign in with your new password in the app.
      </p>
    )
  }

  return (
    <form className="reset-form" onSubmit={handleSubmit}>
      <label>
        New password
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </label>
      <label>
        Confirm password
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </label>
      {error && <p className="reset-error">{error}</p>}
      <button type="submit" className="btn-primary reset-btn" disabled={busy}>
        {busy ? 'Resetting…' : 'Reset Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="reset-page">
      <div className="reset-card">
        <h1>Reset your password</h1>
        <p className="reset-subtitle">Enter a new password for your LC Austin account.</p>
        <Suspense fallback={<p>Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}
