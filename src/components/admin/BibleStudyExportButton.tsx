'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

export default function BibleStudyExportButton() {
  const [actionContainer, setActionContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const createButton = Array.from(document.querySelectorAll<HTMLAnchorElement>('a,button'))
      .find((element) => element.textContent?.includes('Create New'))
    setActionContainer(createButton?.parentElement ?? null)
  }, [])

  const exportSelected = () => {
    const checked = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'))
      .map((input) => {
        if (input.value && input.value !== 'on') return input.value
        const row = input.closest('tr, [data-id]')
        const rowId = row?.getAttribute('data-id')
        if (rowId) return rowId
        const link = row?.querySelector<HTMLAnchorElement>('a[href*="/bible-studies/"]')
        return link?.href.match(/bible-studies\/([^/?#]+)/)?.[1] ?? ''
      })
      .filter(Boolean)

    const semesterId = new URLSearchParams(window.location.search).get('where[semesterRef][equals]')
    if (checked.length === 0 && !semesterId) {
      window.alert('학기를 선택하거나 내보낼 그룹을 먼저 선택해 주세요. · Select a semester or at least one group.')
      return
    }

    const params = new URLSearchParams()
    if (checked.length) params.set('ids', checked.join(','))
    if (semesterId) params.set('semesterId', semesterId)
    window.location.href = `/api/bible-studies/export?${params.toString()}`
  }

  const button = (
    <button
      type="button"
      onClick={exportSelected}
      className="btn btn--style-secondary"
      style={{ padding: '0 10px', marginInlineStart: '0.75rem' }}
    >
      CSV 내보내기 · Export
    </button>
  )

  return actionContainer ? createPortal(button, actionContainer) : null
}
