'use client'

import { useEffect, useState } from 'react'

export type SermonArchiveItem = {
  id: number | string
  title: { ko?: string | null; en?: string | null }
  preacher?: { ko?: string | null; en?: string | null } | null
  date: string
  videoUrl?: string | null
  thumbnailUrl?: string | null
}

const formatDate = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split('-')
  return year && month && day ? `${year}.${month}.${day}` : iso
}

const getEmbedUrl = (videoUrl: string) => {
  try {
    const url = new URL(videoUrl)
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null
    }
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) return url.toString()
      const id = url.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null
    }
    const vimeoMatch = url.hostname.includes('vimeo.com') && url.pathname.match(/\/(\d+)/)
    return vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` : null
  } catch {
    return null
  }
}

function SermonVideoModal({ sermon, onClose }: { sermon: SermonArchiveItem; onClose: () => void }) {
  const embedUrl = sermon.videoUrl ? getEmbedUrl(sermon.videoUrl) : null

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="video-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Sermon video player">
      <div className="video-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="video-modal-close" onClick={onClose} aria-label="Close video">
          <i className="ti ti-x" aria-hidden="true" />
        </button>
        {embedUrl ? (
          <div className="video-modal-frame">
            <iframe
              src={embedUrl}
              title={sermon.title.ko || sermon.title.en || 'Sermon video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="sermon-video-unavailable">
            <p>이 영상은 사이트에서 재생할 수 없습니다. · This video cannot be played here.</p>
          </div>
        )}
        {sermon.videoUrl && (
          <a className="video-modal-yt-link" href={sermon.videoUrl} target="_blank" rel="noopener noreferrer">
            YouTube/Vimeo에서 보기 · Watch on video site ↗
          </a>
        )}
      </div>
    </div>
  )
}

export default function SermonArchive({ sermons, label = '주일 설교 · SUNDAY SERMON' }: { sermons: SermonArchiveItem[]; label?: string }) {
  const [selected, setSelected] = useState<SermonArchiveItem | null>(null)

  return (
    <>
      <div className="sermon-page-grid">
        {sermons.map((sermon) => {
          const hasVideo = Boolean(sermon.videoUrl)
          return (
            <article key={sermon.id} className="sermon-archive-card">
              {hasVideo ? (
                <button
                  type="button"
                  className="sermon-archive-media"
                  onClick={() => setSelected(sermon)}
                  aria-label={`${sermon.title.ko || sermon.title.en || 'Sermon'} video play`}
                  style={sermon.thumbnailUrl ? { backgroundImage: `url(${sermon.thumbnailUrl})` } : undefined}
                >
                  <span className="play-btn-c"><i className="ti ti-player-play" aria-hidden="true" /></span>
                </button>
              ) : (
                <div className="sermon-archive-media sermon-archive-media--empty">
                  <i className="ti ti-microphone-2" aria-hidden="true" />
                </div>
              )}
              <div className="sermon-archive-body">
                <div className="sermon-tag">{label}</div>
                <h2>{sermon.title.ko || sermon.title.en || 'Untitled Sermon'}</h2>
                {sermon.title.en && sermon.title.ko && <p className="sermon-archive-en">{sermon.title.en}</p>}
                <div className="sermon-meta">
                  {formatDate(sermon.date)}
                  {sermon.preacher?.ko && ` · ${sermon.preacher.ko}`}
                  {!sermon.preacher?.ko && sermon.preacher?.en && ` · ${sermon.preacher.en}`}
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {selected && <SermonVideoModal sermon={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
