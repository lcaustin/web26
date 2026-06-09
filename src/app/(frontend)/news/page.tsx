import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'

export const dynamic = 'force-dynamic'

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

export default async function NewsPage() {
  const payload = await getPayload({ config })

  const [siteSettings, newsResult] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload
      .find({ collection: 'news', limit: 100, sort: '-date' })
      .catch(() => ({ docs: [] as NewsDoc[] })),
  ])

  const church = siteSettings?.church
  const news = newsResult.docs as NewsDoc[]

  // Group by bulletin date
  const byDate: Record<string, NewsDoc[]> = {}
  for (const item of news) {
    const key = item.date ? item.date.slice(0, 10) : 'unknown'
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(item)
  }
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))

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
            <i className="ti ti-news" aria-hidden="true" />
          </div>
          <h1 className="dept-detail-ko">교회 소식</h1>
          <div className="dept-detail-en">Church Announcements</div>
        </div>
      </header>

      <section className="dept-detail-body">
        <div className="wrap">
          {news.length === 0 ? (
            <p className="dept-empty">등록된 소식이 없습니다. · No announcements yet.</p>
          ) : (
            <div className="news-page-list">
              {dates.map((date) => (
                <div key={date} className="news-page-group">
                  <div className="news-page-date-header">
                    {formatDate(date)} 주보 · Bulletin
                  </div>
                  <div className="news-list">
                    {byDate[date].map((item) => {
                      const href = item.link ?? (item.slug ? `/news/${item.slug}` : `/news/${item.id}`)
                      const isExternal = Boolean(item.link)
                      return (
                        <a
                          key={item.id}
                          href={href}
                          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className="news-item news-item--linked"
                          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 12 }}
                        >
                          <div className="news-accent" />
                          <div className="news-info">
                            <div className="news-title">
                              {item.title?.ko}
                              {item.title?.en && (
                                <>
                                  <br />
                                  <span style={{ fontWeight: 400, color: 'var(--t2)', fontSize: 11 }}>
                                    {item.title.en}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="news-date">{formatDate(item.date)}</div>
                          </div>
                          {isExternal && (
                            <i className="ti ti-external-link" style={{ color: 'var(--t3)', fontSize: 14, flexShrink: 0 }} aria-hidden="true" />
                          )}
                        </a>
                      )
                    })}
                  </div>
                </div>
              ))}
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
