import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import SermonArchive, { type SermonArchiveItem } from '@/components/SermonArchive'
import VideoPagination from '@/components/VideoPagination'

export const dynamic = 'force-dynamic'

export default async function SermonsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1)
  const payload = await getPayload({ config })

  const [siteSettings, sermonsResult] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({ collection: 'videos', limit: 15, page, sort: '-publishedAt', where: { category: { equals: 'sermon' } } }).catch(() => ({ docs: [], page: 1, totalPages: 1 })),
  ])

  const church = siteSettings?.church
  const sermons = sermonsResult.docs.map((video: any): SermonArchiveItem => ({
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
          <Link href="/" className="dept-back">
            <i className="ti ti-arrow-left" aria-hidden="true" />
            홈 · Home
          </Link>
          <div className="dept-detail-icon">
            <i className="ti ti-microphone-2" aria-hidden="true" />
          </div>
          <h1 className="dept-detail-ko">주일 설교</h1>
          <div className="dept-detail-en">Sunday Sermons</div>
        </div>
      </header>

      <section className="dept-detail-body">
        <div className="wrap">
          {sermons.length > 0 ? (
            <SermonArchive sermons={sermons} category="sermon" initialPage={sermonsResult.page ?? 1} totalPages={sermonsResult.totalPages ?? 1} />
          ) : (
            <p className="dept-empty">등록된 설교가 없습니다. · No sermons have been added yet.</p>
          )}
          <VideoPagination currentPage={sermonsResult.page ?? 1} totalPages={sermonsResult.totalPages ?? 1} mobileHidden />
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
