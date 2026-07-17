'use client'

import { useEffect, useState } from 'react'
import PhotoAlbumCard from './PhotoAlbumCard'

type Album = { id: number | string; slug: string; title: string; imageCount: number; coverUrl: string | null }

export default function PhotoAlbumGrid({ initialAlbums, initialPage, totalPages, totalDocs, category, query }: {
  initialAlbums: Album[]
  initialPage: number
  totalPages: number
  totalDocs: number
  category: string
  query: string
}) {
  const [albums, setAlbums] = useState(initialAlbums)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    setAlbums(isMobile ? initialAlbums.slice(0, 10) : initialAlbums)
    setPage(initialPage)
  }, [initialAlbums, initialPage, category, query, isMobile])

  const effectiveTotalPages = isMobile ? Math.ceil(totalDocs / 10) : totalPages

  const loadMore = async () => {
    if (loading || page >= effectiveTotalPages) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page + 1) })
      params.set('limit', isMobile ? '10' : '15')
      if (category) params.set('category', category)
      if (query) params.set('q', query)
      const response = await fetch('/api/photo-albums?' + params.toString())
      if (!response.ok) throw new Error('Unable to load albums')
      const result = await response.json() as { docs: Album[]; page: number }
      setAlbums((current) => [...current, ...result.docs])
      setPage(result.page)
    } finally {
      setLoading(false)
    }
  }

  return <>
    <div className="photo-album-grid">{albums.map((album) => <PhotoAlbumCard key={album.id} album={album} />)}</div>
    {page < effectiveTotalPages && <button className="photo-mobile-more" type="button" onClick={loadMore} disabled={loading}>
      {loading ? '불러오는 중… · Loading…' : '더보기 · Show more'}
    </button>}
  </>
}
