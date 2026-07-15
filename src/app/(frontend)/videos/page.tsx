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

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page: pageParam, q = '' } = await searchParams
  const keyword = q.trim()
  const page = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1)
  const payload = await getPayload({ config })
  const [siteSettings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({
      collection: 'videos',
      limit: 15,
      page,
      sort: '-publishedAt',
      ...(keyword ? { where: keywordWhere(keyword) } : {}),
    }).catch(() => ({ docs: [], page: 1, totalPages: 1 })),
  ])
  const church = siteSettings?.church
  const videos = result.docs.map((video: any): SermonArchiveItem => ({
    id: video.id,
    title: { ko: video.adminTitle, en: '' },
    date: video.publishedAt,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl,
  }))
  const querySuffix = keyword ? `?q=${encodeURIComponent(keyword)}` : ''

  return (
    <div className="site" id="site">
      <Nav />
      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/" className="dept-back"><i className="ti ti-arrow-left" aria-hidden="true" />홈 · Home</Link>
          <div className="dept-detail-icon"><i className="ti ti-video" aria-hidden="true" /></div>
          <h1 className="dept-detail-ko">영상</h1>
          <div className="dept-detail-en">{keyword ? `"${keyword}" 검색 결과` : 'Videos'}</div>
        </div>
      </header>
      <section className="dept-detail-body">
        <div className="wrap">
          {videos.length ? (
            <SermonArchive sermons={videos} label={keyword ? `${keyword} · SEARCH` : '영상 · VIDEOS'} />
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
