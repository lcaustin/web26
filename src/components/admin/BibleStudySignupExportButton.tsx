'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

export default function BibleStudySignupExportButton() {
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
        const link = row?.querySelector<HTMLAnchorElement>('a[href*="/bible-study-signups/"]')
        return link?.href.match(/bible-study-signups\/([^/?#]+)/)?.[1] ?? ''
      })
      .filter(Boolean)
    if (!checked.length) {
      window.alert('내보낼 신청자를 먼저 선택해 주세요. · Select at least one signup.')
      return
    }
    window.location.href = `/api/bible-studies/signups-export?ids=${encodeURIComponent(checked.join(','))}`
  }

  const button = <button type="button" onClick={exportSelected} className="btn btn--style-secondary" style={{ padding: '0 10px', marginInlineStart: '0.75rem' }}>
    CSV 내보내기 · Export selected
  </button>

  return actionContainer ? createPortal(button, actionContainer) : null
}
