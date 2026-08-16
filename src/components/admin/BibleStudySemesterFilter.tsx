'use client'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

type Semester = { id: string | number; name: string }

export default function BibleStudySemesterFilter() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [value, setValue] = useState('')
  const [container, setContainer] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const searchRow = document.querySelector<HTMLElement>('.search-bar')
    const host = document.createElement('div')
    if (searchRow?.parentElement) { searchRow.parentElement.insertBefore(host, searchRow.nextSibling); setContainer(host) }
    return () => host.remove()
  }, [])
  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get('where[semesterRef][equals]') || ''
    fetch('/api/bible-study-semesters?limit=100&sort=name&depth=0').then((r) => r.json()).then((d) => {
      const next = (d.docs ?? []).sort((a: Semester, b: Semester) => {
        const parse = (name: string) => { const match = name.match(/(\d{4}).*(Spring|Fall)/i); return match ? [Number(match[1]), match[2].toLowerCase() === 'fall' ? 1 : 0] : [0, 0] }
        const [yearA, seasonA] = parse(a.name); const [yearB, seasonB] = parse(b.name)
        return yearB - yearA || seasonB - seasonA
      })
      setSemesters(next)
      const selected = current || String(next[0]?.id || '')
      setValue(selected)
      if (!current && selected) {
        const params = new URLSearchParams(window.location.search)
        params.set('where[semesterRef][equals]', selected)
        window.location.replace(`${window.location.pathname}?${params.toString()}`)
      }
    })
  }, [])
  const change = (next: string) => {
    setValue(next)
    const params = new URLSearchParams(window.location.search)
    if (next) params.set('where[semesterRef][equals]', next)
    else params.delete('where[semesterRef][equals]')
    params.delete('page')
    window.location.href = `${window.location.pathname}?${params.toString()}`
  }
  if (!container) return null
  return createPortal(<div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', margin: '0 0 0.75rem', padding: '0.75rem 1rem', border: '1px solid var(--theme-elevation-150)', borderRadius: 4 }}><label htmlFor="bible-study-semester-filter" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>학기 · Semester</label><select id="bible-study-semester-filter" value={value} onChange={(e) => change(e.target.value)} style={{ minWidth: 220, padding: '0.45rem 0.6rem' }}><option value="">전체 학기 · All semesters</option>{semesters.map((semester) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}</select></div>, container)
}
