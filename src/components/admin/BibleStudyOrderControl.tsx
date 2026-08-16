'use client'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

type Item = { id: string | number; adminTitle?: string; order?: number }

export default function BibleStudyOrderControl() {
  const [items, setItems] = useState<Item[]>([])
  const [displayOrders, setDisplayOrders] = useState<Record<string, number>>({})
  const [semesterId, setSemesterId] = useState('')
  const [saving, setSaving] = useState(false)
  const [container, setContainer] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setContainer(document.querySelector('form'))
    const match = window.location.pathname.match(/bible-study-semesters\/([^/]+)/)
    if (match?.[1]) setSemesterId(match[1])
  }, [])
  useEffect(() => {
    if (!semesterId) return
    fetch(`/api/bible-studies?limit=100&sort=order&depth=0&where[semesterRef][equals]=${encodeURIComponent(semesterId)}`).then((r) => r.json()).then((d) => {
      const next = d.docs ?? []
      setItems(next)
      setDisplayOrders(Object.fromEntries(next.map((item: Item, index: number) => [String(item.id), item.order || index + 1])))
    })
  }, [semesterId])
  const move = (from: number, to: number) => { if (to < 0 || to >= items.length) return; const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); setItems(next) }
  const save = async () => {
    setSaving(true)
    try {
      const responses = await Promise.all(items.map((item, index) => fetch(`/api/bible-studies/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: index + 1 }) })))
      if (responses.some((response) => !response.ok)) throw new Error('Order update failed')
      setItems((current) => current.map((item, index) => ({ ...item, order: index + 1 })))
      setDisplayOrders(Object.fromEntries(items.map((item, index) => [String(item.id), index + 1])))
      window.alert('순서를 저장했습니다. · Order saved.')
    } catch {
      window.alert('순서를 저장하지 못했습니다. · Could not save order.')
    } finally { setSaving(false) }
  }
  if (!items.length || !container) return null
  return createPortal(<div style={{ width: '100%', boxSizing: 'border-box', marginBlock: 'var(--gutter-h)', padding: 'var(--base) var(--gutter-h)', background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-elevation-150)', borderRadius: 'var(--style-radius-s)' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--base)', marginBottom: 'calc(var(--base) * .75)' }}><strong>성경공부 순서 · Bible Study order</strong><button type="button" onClick={save} disabled={saving} className="btn btn--size-medium btn--style-primary">{saving ? '저장 중…' : '순서 저장 · Save order'}</button></div><div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * .35)', maxWidth: 900 }}>{items.map((item, index) => <div key={item.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))} onDragOver={(e) => e.preventDefault()} onDrop={(e) => move(Number(e.dataTransfer.getData('text/plain')), index)} style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--base) * .5)', minHeight: 'calc(var(--base) * 2)', padding: 'calc(var(--base) * .4) calc(var(--base) * .5)', background: 'var(--theme-input-bg)', border: '1px solid var(--theme-elevation-200)', borderRadius: 'var(--style-radius-s)', cursor: 'grab' }}><span style={{ width: 'var(--base)', color: 'var(--theme-elevation-600)' }}>{displayOrders[String(item.id)]}</span><span aria-hidden="true">⠿</span><span>{item.adminTitle || item.id}</span></div>)}</div></div>, container)
}
