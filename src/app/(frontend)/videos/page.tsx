import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import SermonArchive, { type SermonArchiveItem } from '@/components/SermonArchive'
import VideoPagination from '@/components/VideoPagination'

export const dynamic = 'force-dynamic'

function keywordWhere(keyword: string): Where | undefined {
  if (!keyword) return undefined
  const compactKeyword = keyword.replace(/\s/g, '')
  const variants = Array.from(new Set([keyword, compactKeyword].filter(Boolean)))
  const or: Where[] = []
  for (const term of variants) {
    or.push({ adminTitle: { contains: term } })
    or.push({ tags: { contains: term } })
    or.push({ description: { contains: term } })
  }
  return {
    or,
  }
}

const categories = [
  { value: '', ko: '전체', en: 'All' },
  { value: 'sermon', ko: '주일설교', en: 'Sunday Sermon' },
  { value: 'worship', ko: '경배와찬양', en: 'Worship' },
  { value: 'choir', ko: '찬양대', en: 'Choir' },
  { value: 'offering-song', ko: '헌금송', en: 'Offering Song' },
  { value: 'testimony', ko: '간증', en: 'Testimony' },
  { value: 'event', ko: '행사', en: 'Events' },
  { value: 'education', ko: '교육부', en: 'Next Generation' },
]

function categoryWhere(category: string): Where | undefined {
  if (['sermon', 'worship', 'choir', 'offering-song'].includes(category)) return { category: { equals: category } }
  if (category === 'testimony') return keywordWhere('간증')
  if (category === 'event') return keywordWhere('행사')
  if (category === 'education') return { or: [{ category: { equals: 'ministry' } }, keywordWhere('교육부')!] }
  return undefined
}

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; category?: string }> }) {
  const { page: pageParam, q = '', category: categoryParam = '' } = await searchParams
  const keyword = q.trim()
  const category = categories.some((item) => item.value === categoryParam) ? categoryParam : ''
  const page = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1)
  const filters = [categoryWhere(category), keywordWhere(keyword)].filter(Boolean) as Where[]
  const where: Where | undefined = filters.length > 1 ? { and: filters } : filters[0]
  const selectedCategory = categories.find((item) => item.value === category)
  const videoHref = (nextCategory: string) => {
    const params = new URLSearchParams()
    if (nextCategory) params.set('category', nextCategory)
    const search = params.toString()
    return '/videos' + (search ? '?' + search : '')
  }
  const queryParams = new URLSearchParams()
  if (category) queryParams.set('category', category)
  if (keyword) queryParams.set('q', keyword)
  const querySuffix = queryParams.toString() ? `?${queryParams.toString()}` : ''
  const clearSearchHref = category ? '/videos?category=' + encodeURIComponent(category) : '/videos'
  const payload = await getPayload({ config })
  const [siteSettings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({
      collection: 'videos',
      limit: 15,
      page,
      sort: '-publishedAt',
      ...(where ? { where } : {}),
    }).catch(() => ({ docs: [], page: 1, totalPages: 1, totalDocs: 0 })),
  ])
  const church = siteSettings?.church
  const videos = result.docs.map((video: any): SermonArchiveItem => ({
    id: video.id,
    title: { ko: video.adminTitle, en: '' },
    date: video.publishedAt,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl,
  }))
  return (
    <div className="site" id="site">
      <Nav />
      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/" className="dept-back"><i className="ti ti-arrow-left" aria-hidden="true" />홈 · Home</Link>
          <div className="video-page-heading">
            <div className="video-page-title">
              <div className="dept-detail-icon"><i className="ti ti-video" aria-hidden="true" /></div>
              <div><h1 className="dept-detail-ko">영상</h1><div className="dept-detail-en">Videos</div></div>
            </div>
            <form className="video-search" action="/videos">
              {category && <input type="hidden" name="category" value={category} />}
              <label className="sr-only" htmlFor="video-search">영상 검색</label>
              <input id="video-search" type="search" name="q" defaultValue={keyword} placeholder="영상 검색 · Search videos" />
              {keyword && <Link className="video-search-clear" href={clearSearchHref} aria-label="Clear video search"><i className="ti ti-x" aria-hidden="true" /></Link>}
              <button type="submit" aria-label="Search videos"><i className="ti ti-search" aria-hidden="true" /></button>
            </form>
          </div>
        </div>
      </header>
      <section className="dept-detail-body">
        <div className="wrap">
          <nav className="video-category-nav" aria-label="Video categories">
            {categories.map((item) => <Link key={item.value || 'all'} href={videoHref(item.value)} className={item.value === category ? 'is-active' : undefined}>
              {item.ko}<span>{item.en}</span>
            </Link>)}
          </nav>
          {videos.length ? (
            <SermonArchive sermons={videos} label={keyword ? `${keyword} · SEARCH` : category ? `${selectedCategory?.ko} · ${selectedCategory?.en?.toUpperCase()}` : ''} loadMoreUrl={`/api/videos${querySuffix}`} initialPage={result.page ?? 1} totalPages={result.totalPages ?? 1} totalDocs={result.totalDocs ?? 0} />
          ) : (
            <p className="dept-empty">등록된 영상이 없습니다. · No videos have been added yet.</p>
          )}
          <VideoPagination currentPage={result.page ?? 1} totalPages={result.totalPages ?? 1} basePath={`/videos${querySuffix}`} mobileHidden />
        </div>
      </section>
      <Footer nameKo={church?.name?.ko} nameEn={church?.name?.en} addressKo={church?.address?.ko} phone={church?.phone} email={church?.email} />
    </div>
  )
}
