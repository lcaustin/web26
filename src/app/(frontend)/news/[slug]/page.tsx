import config from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const [siteSettings, resultBySlug] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload
      .find({ collection: 'news', where: { slug: { equals: slug } }, limit: 1 })
      .catch(() => ({ docs: [] })),
  ])

  // Fall back to numeric ID lookup if slug not found
  let item = resultBySlug.docs[0] ?? null
  if (!item && /^\d+$/.test(slug)) {
    const byId = await payload
      .find({ collection: 'news', where: { id: { equals: Number(slug) } }, limit: 1 })
      .catch(() => ({ docs: [] }))
    item = byId.docs[0] ?? null
  }

  if (!item) notFound()

  const church = siteSettings?.church
  const ko = (item as any).content?.ko
  const en = (item as any).content?.en
  const hasKo = Boolean(ko?.root?.children?.length)
  const hasEn = Boolean(en?.root?.children?.length)

  return (
    <div className="site" id="site">
      <Nav />

      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/news" className="dept-back">
            <i className="ti ti-arrow-left" aria-hidden="true" />
            교회 소식 · News
          </Link>
          <div className="dept-detail-icon">
            <i className="ti ti-speakerphone" aria-hidden="true" />
          </div>
          <h1 className="dept-detail-ko">{(item as any).title?.ko}</h1>
          <div className="dept-detail-en">{(item as any).title?.en}</div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 6 }}>
            {formatDate((item as any).date)}
          </div>
        </div>
      </header>

      <section className="dept-detail-body">
        <div className="wrap">
          {hasKo || hasEn ? (
            <>
              {hasKo && (
                <div className="dept-lang-block">
                  <div className="dept-lang-label">한국어</div>
                  <div className="dept-prose">
                    <RichText data={ko} />
                  </div>
                </div>
              )}
              {hasEn && (
                <div className="dept-lang-block">
                  <div className="dept-lang-label">English</div>
                  <div className="dept-prose">
                    <RichText data={en} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="dept-empty">내용이 없습니다. · No content available.</p>
          )}

          {(item as any).link && (
            <div style={{ marginTop: 32 }}>
              <a
                href={(item as any).link}
                target="_blank"
                rel="noopener noreferrer"
                className="dept-back"
                style={{ display: 'inline-flex' }}
              >
                <i className="ti ti-external-link" aria-hidden="true" />
                관련 링크 · Related Link
              </a>
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
