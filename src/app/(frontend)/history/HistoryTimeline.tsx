'use client'

import { useState } from 'react'

type HistoryEntry = {
  id: string
  date: string
  title: string
}

type HistoryGroup = {
  entries: HistoryEntry[]
  year: string
}

const YEARS_PER_PAGE = 1

export default function HistoryTimeline({ groups }: { groups: HistoryGroup[] }) {
  const [visibleYears, setVisibleYears] = useState(YEARS_PER_PAGE)
  const visibleGroups = groups.slice(0, visibleYears)
  const hasMore = visibleYears < groups.length

  return (
    <>
      <div className="history-timeline">
        {visibleGroups.map((group) => (
          <article className="history-item" key={group.year}>
            <div className="history-year">{group.year}</div>
            <div className="history-card">
              <ol className="history-list">
                {group.entries.map((item) => (
                  <li key={item.id}>
                    <time>{item.date}</time>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          className="history-more"
          onClick={() => setVisibleYears((value) => Math.min(value + YEARS_PER_PAGE, groups.length))}
        >
          Show more · 더보기
        </button>
      )}
    </>
  )
}
