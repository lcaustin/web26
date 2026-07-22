'use client'

import { useEffect, useState } from 'react'
import { newsCategoryLabel } from '@/lib/news-categories'

export type NewsListItem = {
  id: string | number
  slug?: string | null
  title?: { ko?: string | null; en?: string | null } | null
  date: string
  category?: string | null
  link?: string | null
}

const formatDate = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

export default function NewsList({ initialNews, initialPage, totalPages, totalDocs, query, category }: {
  initialNews: NewsListItem[]
  initialPage: number
  totalPages: number
  totalDocs: number
  query: string
  category: string
}) {
  const [news, setNews] = useState(initialNews)
  const [page, setPage] = useState(initialPage)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    setNews(isMobile ? initialNews.slice(0, 10) : initialNews)
    setPage(initialPage)
  }, [initialNews, initialPage, isMobile, query, category])

  const effectiveTotalPages = isMobile ? Math.ceil(totalDocs / 10) : totalPages
  const loadMore = async () => {
    if (loading || page >= effectiveTotalPages) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page + 1), limit: '10' })
      if (query) params.set('q', query)
      if (category) params.set('category', category)
      const response = await fetch('/api/news?' + params.toString())
      if (!response.ok) throw new Error('Unable to load News')
      const result = await response.json() as { docs: NewsListItem[]; page: number }
      setNews((current) => [...current, ...result.docs])
      setPage(result.page)
    } finally {
      setLoading(false)
    }
  }

  return <>
    <div className="news-page-list">
      {news.map((item) => {
        const href = item.link ?? (item.slug ? `/news/${item.slug}` : `/news/${item.id}`)
        const isExternal = Boolean(item.link)
        const categoryLabel = newsCategoryLabel(item.category)
        return <a key={item.id} href={href} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`news-item news-item--linked${categoryLabel ? ' news-item--has-category' : ''}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="news-accent" />
          <div className="news-info"><div className="news-title">{item.title?.ko}{item.title?.en && <><br /><span style={{ fontWeight: 400, color: 'var(--t2)', fontSize: 11 }}>{item.title.en}</span></>}</div><div className="news-date">{categoryLabel && <span className="news-category-label">{categoryLabel}</span>}{formatDate(item.date)}</div></div>
          {isExternal && <i className="ti ti-external-link" style={{ color: 'var(--t3)', fontSize: 14, flexShrink: 0 }} aria-hidden="true" />}
        </a>
      })}
    </div>
    {page < effectiveTotalPages && <button className="news-mobile-more" type="button" onClick={loadMore} disabled={loading}>{loading ? '불러오는 중… · Loading…' : '더보기 · Show more'}</button>}
  </>
}
