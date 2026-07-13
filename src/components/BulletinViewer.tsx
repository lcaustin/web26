'use client'

import { useState } from 'react'

export type BulletinViewerItem = {
  id: number | string
  issueDate: string
  url: string
}

const formatDate = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split('-')
  return year && month && day ? `${year}.${month}.${day}` : iso
}

/** In-page PDF reader and archive selector for the weekly bulletin. */
export default function BulletinViewer({ bulletins }: { bulletins: BulletinViewerItem[] }) {
  const [selectedId, setSelectedId] = useState(bulletins[0]?.id)
  const [visibleCount, setVisibleCount] = useState(5)
  const selected = bulletins.find((bulletin) => bulletin.id === selectedId) ?? bulletins[0]
  const visibleBulletins = bulletins.slice(0, visibleCount)

  if (!selected) return null

  return (
    <div className="bulletin-layout">
      <div className="bulletin-latest">
        <div className="bulletin-latest-head">
          <div>
            <div className="dept-lang-label">WEEKLY BULLETIN</div>
            <h2>{formatDate(selected.issueDate)} 주보</h2>
          </div>
          <a className="bulletin-open-link" href={selected.url} target="_blank" rel="noopener noreferrer">
            <i className="ti ti-external-link" aria-hidden="true" />
            PDF 열기 · Open PDF
          </a>
        </div>
        <iframe
          key={selected.id}
          className="bulletin-preview"
          src={selected.url}
          title={`${formatDate(selected.issueDate)} bulletin PDF`}
        />
      </div>

      <div className="bulletin-archive">
        <div className="dept-lang-label">BULLETIN ARCHIVE</div>
        <div className="bulletin-list">
          {visibleBulletins.map((bulletin) => {
            const isSelected = bulletin.id === selected.id
            return (
              <button
                key={bulletin.id}
                type="button"
                className={`bulletin-list-item${isSelected ? ' bulletin-list-item--selected' : ''}`}
                onClick={() => setSelectedId(bulletin.id)}
                aria-pressed={isSelected}
              >
                <i className="ti ti-file-type-pdf" aria-hidden="true" />
                <span>{formatDate(bulletin.issueDate)} 일자 주보</span>
                {isSelected ? (
                  <span className="bulletin-list-current">보고 있는 주보 · Viewing</span>
                ) : (
                  <i className="ti ti-eye bulletin-list-external" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
        {visibleCount < bulletins.length && (
          <button
            type="button"
            className="bulletin-show-more"
            onClick={() => setVisibleCount((count) => Math.min(count + 5, bulletins.length))}
          >
            <i className="ti ti-plus" aria-hidden="true" />
            더보기 · Show more
          </button>
        )}
      </div>
    </div>
  )
}
