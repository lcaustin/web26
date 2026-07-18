import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import VideoPagination from '@/components/VideoPagination'
import NewsList, { type NewsListItem } from '@/components/NewsList'

export const dynamic = 'force-dynamic'
export const metadata = { title: '교회 소식', description: '어스틴 주님의교회 최신 소식과 공지입니다.', alternates: { canonical: '/news' } }

type NewsDoc = {
  id: string | number
  slug?: string | null
  title?: { ko?: string | null; en?: string | null } | null
  date: string
  link?: string | null
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page: pageParam, q = '' } = await searchParams
  const query = q.trim()
  const page = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1)
  const where: Where | undefined = query ? {
    or: [
      { 'title.ko': { contains: query } },
      { 'title.en': { contains: query } },
      { adminTitle: { contains: query } },
    ],
  } : undefined
  const querySuffix = query ? `?q=${encodeURIComponent(query)}` : ''
  const payload = await getPayload({ config })

  const [siteSettings, newsResult] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload
      .find({ collection: 'news', limit: 10, page, sort: '-date', ...(where ? { where } : {}) })
      .catch(() => ({ docs: [] as NewsDoc[], page: 1, totalPages: 1, totalDocs: 0 })),
  ])

  const church = siteSettings?.church
  const news = newsResult.docs as NewsDoc[]

  return (
    <div className="site" id="site">
      <Nav />

      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/" className="dept-back">
            <i className="ti ti-arrow-left" aria-hidden="true" />
            홈 · Home
          </Link>
          <div className="news-page-heading">
            <div className="news-page-title">
              <div className="dept-detail-icon"><i className="ti ti-news" aria-hidden="true" /></div>
              <div><h1 className="dept-detail-ko">교회 소식</h1><div className="dept-detail-en">Church Announcements</div></div>
            </div>
            <form className="news-search" action="/news">
              <label className="sr-only" htmlFor="news-search">소식 검색</label>
              <input id="news-search" type="search" name="q" defaultValue={query} placeholder="소식 검색 · Search news" />
              {query && <Link className="news-search-clear" href="/news" aria-label="Clear News search"><i className="ti ti-x" aria-hidden="true" /></Link>}
              <button type="submit" aria-label="Search News"><i className="ti ti-search" aria-hidden="true" /></button>
            </form>
          </div>
        </div>
      </header>

      <section className="dept-detail-body">
        <div className="wrap">
          {news.length === 0 ? (
            <p className="dept-empty">{query ? '검색 결과가 없습니다.' : '등록된 소식이 없습니다. · No announcements yet.'}</p>
          ) : (
            <NewsList initialNews={news as NewsListItem[]} initialPage={newsResult.page ?? 1} totalPages={newsResult.totalPages ?? 1} totalDocs={newsResult.totalDocs ?? 0} query={query} />
          )}
          <VideoPagination currentPage={newsResult.page ?? 1} totalPages={newsResult.totalPages ?? 1} basePath={`/news${querySuffix}`} mobileHidden />
        </div>
      </section>

      <Footer
        nameKo={church?.name?.ko}
        nameEn={church?.name?.en}
        addressKo={church?.address?.ko}
        phone={church?.phone}
        email={church?.email}
      />
    </div>
  )
}
