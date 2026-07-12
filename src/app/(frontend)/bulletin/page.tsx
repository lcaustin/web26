import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'

export const dynamic = 'force-dynamic'

type Bulletin = {
  id: number | string
  filename?: string | null
  issueDate: string
  url?: string | null
}

const formatDate = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split('-')
  return year && month && day ? `${year}.${month}.${day}` : iso
}

export default async function BulletinPage() {
  const payload = await getPayload({ config })

  const [siteSettings, bulletinsResult] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload
      .find({ collection: 'bulletins', limit: 100, sort: '-issueDate' })
      .catch(() => ({ docs: [] as Bulletin[] })),
  ])

  const church = siteSettings?.church
  const bulletins = (bulletinsResult.docs as Bulletin[]).filter((bulletin) => Boolean(bulletin.url))
  const latest = bulletins[0]

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
          {latest?.url ? (
            <div className="bulletin-latest">
              <div className="bulletin-latest-head">
                <div>
                  <div className="dept-lang-label">LATEST BULLETIN</div>
                  <h2>{formatDate(latest.issueDate)} 주보</h2>
                </div>
                <a
                  className="bulletin-open-link"
                  href={latest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="ti ti-external-link" aria-hidden="true" />
                  PDF 열기 · Open PDF
                </a>
              </div>
              <iframe
                className="bulletin-preview"
                src={latest.url}
                title={`${formatDate(latest.issueDate)} bulletin PDF`}
              />
            </div>
          ) : (
            <p className="dept-empty">아직 등록된 주보가 없습니다. · No bulletins have been uploaded yet.</p>
          )}

          {bulletins.length > 0 && (
            <div className="bulletin-archive">
              <div className="dept-lang-label">BULLETIN ARCHIVE</div>
              <div className="bulletin-list">
                {bulletins.map((bulletin) => (
                  <a
                    key={bulletin.id}
                    className="bulletin-list-item"
                    href={bulletin.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="ti ti-file-type-pdf" aria-hidden="true" />
                    <span>{formatDate(bulletin.issueDate)} 일자 주보</span>
                    <i className="ti ti-external-link bulletin-list-external" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          )}
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
