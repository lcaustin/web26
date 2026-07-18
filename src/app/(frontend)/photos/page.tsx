import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import VideoPagination from '@/components/VideoPagination'
import PhotoAlbumGrid from '@/components/PhotoAlbumGrid'

export const dynamic = 'force-dynamic'
export const metadata = { title: '사진', description: '어스틴 주님의교회 사진 앨범입니다.', alternates: { canonical: '/photos' } }

const base = (process.env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')
const imageUrl = (url?: string | null) => {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return url
  return base + '/' + url.replace(/^\/+/, '')
}

const categories = [
  { value: '', ko: '전체', en: 'All' },
  { value: '새가족', ko: '새가족', en: 'New Families' },
  { value: '특별행사', ko: '특별행사', en: 'Special Events' },
  { value: '교육부', ko: '교육부', en: 'Next Generation' },
  { value: '세례식', ko: '세례식', en: 'Baptism' },
  { value: '절기행사', ko: '절기행사', en: 'Seasonal' },
  { value: '단기선교', ko: '단기선교', en: 'Missions' },
]

export default async function PhotosPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; q?: string }> }) {
  const { page: pageParam, category: categoryParam = '', q: queryParam = '' } = await searchParams
  const category = categories.some((item) => item.value === categoryParam) ? categoryParam : ''
  const query = queryParam.trim()
  const page = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1)
  const filters: Where[] = []
  if (category) filters.push({ or: [{ tags: { contains: category } }, { title: { contains: category } }] })
  if (query) filters.push({ or: [{ tags: { contains: query } }, { title: { contains: query } }] })
  const where: Where | undefined = filters.length > 1 ? { and: filters } : filters[0]
  const photoHref = (nextCategory: string) => {
    const params = new URLSearchParams()
    if (nextCategory) params.set('category', nextCategory)
    const search = params.toString()
    return '/photos' + (search ? '?' + search : '')
  }
  const paginationParams = new URLSearchParams()
  if (category) paginationParams.set('category', category)
  if (query) paginationParams.set('q', query)
  const paginationQuery = paginationParams.toString()
  const clearSearchHref = category ? '/photos?category=' + encodeURIComponent(category) : '/photos'
  const payload = await getPayload({ config })
  const [siteSettings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({ collection: 'photo-albums', page, limit: 15, sort: '-eventDate', ...(where ? { where } : {}) }).catch(() => ({ docs: [], page: 1, totalPages: 1, totalDocs: 0 })),
  ])

  return <div className="site" id="site"><Nav />
    <header className="dept-detail-head"><div className="wrap">
      <Link href="/" className="dept-back"><i className="ti ti-arrow-left" aria-hidden="true" />홈 · Home</Link>
      <div className="photo-page-heading">
        <div className="photo-page-title">
          <div className="dept-detail-icon"><i className="ti ti-photo" aria-hidden="true" /></div>
          <div><h1 className="dept-detail-ko">사진</h1><div className="dept-detail-en">Photos</div></div>
        </div>
        <form className="photo-search" action="/photos">
          {category && <input type="hidden" name="category" value={category} />}
          <label className="sr-only" htmlFor="photo-search">사진 검색</label>
          <input id="photo-search" type="search" name="q" defaultValue={query} placeholder="사진 검색 · Search photos" />
          {query && <Link className="photo-search-clear" href={clearSearchHref} aria-label="Clear photo search"><i className="ti ti-x" aria-hidden="true" /></Link>}
          <button type="submit" aria-label="Search photos"><i className="ti ti-search" aria-hidden="true" /></button>
        </form>
      </div>
    </div></header>
    <section className="dept-detail-body"><div className="wrap">
      <nav className="photo-category-nav" aria-label="Photo categories">
        {categories.map((item) => <Link key={item.value || 'all'} href={photoHref(item.value)} className={item.value === category ? 'is-active' : undefined}>
          {item.ko}<span>{item.en}</span>
        </Link>)}
      </nav>
      {result.docs.length ? <PhotoAlbumGrid initialAlbums={result.docs.map((album: any) => ({ id: album.id, slug: album.slug, title: album.title, imageCount: Number(album.imageCount ?? 0), coverUrl: imageUrl(album.coverImageUrl) }))} initialPage={result.page ?? 1} totalPages={result.totalPages ?? 1} totalDocs={result.totalDocs ?? 0} category={category} query={query} /> : <p className="dept-empty">검색 결과가 없습니다.</p>}
      <VideoPagination currentPage={result.page ?? 1} totalPages={result.totalPages ?? 1} basePath={'/photos' + (paginationQuery ? '?' + paginationQuery : '')} mobileHidden />
    </div></section>
    <Footer nameKo={siteSettings?.church?.name?.ko} nameEn={siteSettings?.church?.name?.en} addressKo={siteSettings?.church?.address?.ko} phone={siteSettings?.church?.phone} email={siteSettings?.church?.email} />
  </div>
}
