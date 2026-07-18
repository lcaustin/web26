import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import BulletinViewer from '@/components/BulletinViewer'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import VideoPagination from '@/components/VideoPagination'

export const dynamic = 'force-dynamic'

type Bulletin = {
  id: number | string
  filename?: string | null
  issueDate: string
  url?: string | null
}

export default async function BulletinPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1)
  const payload = await getPayload({ config })

  const [siteSettings, bulletinsResult] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload
      .find({ collection: 'bulletins', limit: 5, page, sort: '-issueDate' })
      .catch(() => ({ docs: [] as Bulletin[], page: 1, totalPages: 1 })),
  ])

  const church = siteSettings?.church
  const bulletins = (bulletinsResult.docs as Bulletin[]).filter((bulletin) => Boolean(bulletin.url))

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
            <i className="ti ti-file-description" aria-hidden="true" />
          </div>
          <h1 className="dept-detail-ko">교회 주보</h1>
          <div className="dept-detail-en">Weekly Bulletin</div>
        </div>
      </header>

      <section className="dept-detail-body">
        <div className="wrap bulletin-layout">
          {bulletins.length > 0 ? (
            <BulletinViewer
              initialBulletins={bulletins.map((bulletin) => ({
                id: bulletin.id,
                issueDate: bulletin.issueDate,
                url: bulletin.url!,
              }))}
              initialPage={bulletinsResult.page ?? 1}
              totalPages={bulletinsResult.totalPages ?? 1}
            />
          ) : (
            <p className="dept-empty">아직 등록된 주보가 없습니다. · No bulletins have been uploaded yet.</p>
          )}
          <VideoPagination currentPage={bulletinsResult.page ?? 1} totalPages={bulletinsResult.totalPages ?? 1} mobileHidden />
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
