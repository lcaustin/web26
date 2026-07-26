'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

export default function DuplicateSemesterButton() {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const create = Array.from(document.querySelectorAll<HTMLAnchorElement>('a,button')).find((el) => el.textContent?.includes('Create New'))
    setContainer(create?.parentElement ?? null)
  }, [])

  const duplicate = async () => {
    const selected = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'))
      .map((input) => {
        if (input.value && input.value !== 'on') return input.value
        const row = input.closest('tr, [data-id]')
        const rowId = row?.getAttribute('data-id')
        if (rowId) return rowId
        const editLink = row?.querySelector<HTMLAnchorElement>('a[href*="/bible-study-semesters/"]')
        return editLink?.href.match(/bible-study-semesters\/([^/?#]+)/)?.[1] ?? ''
      })
      .filter(Boolean)
    if (selected.length !== 1) {
      window.alert('복사할 학기 하나를 선택해 주세요. · Select exactly one semester.')
      return
    }
    const newName = window.prompt('새 학기 이름을 입력하세요. · Enter the new semester name:')
    if (!newName?.trim()) return
    const response = await fetch('/api/bible-study-semesters/duplicate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceSemesterId: selected[0], newName: newName.trim() }),
    })
    const result = await response.json()
    if (!response.ok) { window.alert(result.error || '복사에 실패했습니다.'); return }
    window.alert(`${result.groupsCopied}개 그룹을 복사했습니다. · Groups copied: ${result.groupsCopied}`)
    window.location.reload()
  }

  const button = <button type="button" onClick={duplicate} className="btn btn--style-secondary" style={{ padding: '0 10px', marginInlineStart: '0.75rem' }}>
    그룹 복사 · Duplicate groups
  </button>
  return container ? createPortal(button, container) : null
}
