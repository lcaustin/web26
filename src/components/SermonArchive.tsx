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

type Props = {
  sermons: SermonArchiveItem[]
  label?: string
  category?: string
  loadMoreUrl?: string
  initialPage?: number
  totalPages?: number
  totalDocs?: number
}

export default function SermonArchive({ sermons, label = '주일 설교 · SUNDAY SERMON', category, loadMoreUrl, initialPage = 1, totalPages = 1, totalDocs = 0 }: Props) {
  const [selected, setSelected] = useState<SermonArchiveItem | null>(null)
  const [items, setItems] = useState(sermons)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  // Pagination navigates within the same route, so this client component is
  // preserved by Next.js. Reset its initial state when the server delivers a
  // different page of videos.
  useEffect(() => {
    setItems(isMobile ? sermons.slice(0, 10) : sermons)
    setPage(initialPage)
    setSelected(null)
    setLoadError(false)
  }, [sermons, initialPage, isMobile])

  const effectiveTotalPages = isMobile && totalDocs ? Math.ceil(totalDocs / 10) : totalPages

  const loadMore = async () => {
    const endpoint = loadMoreUrl || (category ? `/api/videos?category=${encodeURIComponent(category)}` : null)
    if (!endpoint || loading || page >= effectiveTotalPages) return
    setLoading(true)
    setLoadError(false)
    try {
      const url = new URL(endpoint, window.location.origin)
      url.searchParams.set('page', String(page + 1))
      url.searchParams.set('limit', isMobile ? '10' : '15')
      const response = await fetch(url.pathname + url.search)
      if (!response.ok) throw new Error('Unable to load more videos')
      const result = await response.json() as { docs: SermonArchiveItem[]; page: number }
      setItems((current) => [...current, ...result.docs])
      setPage(result.page)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="sermon-page-grid">
        {items.map((sermon) => {
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
      {(loadMoreUrl || category) && page < effectiveTotalPages && (
        <button type="button" className="archive-mobile-show-more" onClick={loadMore} disabled={loading}>
          {loading ? '불러오는 중… · Loading…' : '더보기 · Show more'}
        </button>
      )}
      {loadError && <p className="archive-load-error">영상을 불러올 수 없습니다. · Unable to load more videos.</p>}
      {selected && <SermonVideoModal sermon={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
