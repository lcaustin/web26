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

export default async function PageDetail({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const [siteSettings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload
      .find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1 })
      .catch(() => ({ docs: [] })),
  ])

  const page = result.docs[0] as any
  if (!page) notFound()

  const church = siteSettings?.church

  const hasCallout =
    page.callout?.tagline?.ko ||
    page.callout?.tagline?.en ||
    page.callout?.message?.ko ||
    page.callout?.message?.en

  const heroImageUrl =
    (page.heroImage?.url as string | undefined) ??
    (page.heroImageUrl as string | undefined) ??
    null

  const heroTagline = page.callout?.tagline?.ko ?? page.callout?.tagline?.en ?? null
  const sections: any[] = page.sections ?? []

  return (
    <div className="site" id="site">
      <Nav />

      {/* Page header */}
      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/" className="dept-back">
            <i className="ti ti-arrow-left" aria-hidden="true" />
            홈 · Home
          </Link>
          <h1 className="dept-detail-ko">{page.title?.ko}</h1>
          {(page.subtitle?.ko || page.subtitle?.en) && (
            <div className="dept-detail-en">
              {page.subtitle?.en || page.subtitle?.ko}
            </div>
          )}
        </div>
      </header>

      {/* Hero banner */}
      {heroImageUrl && (
        <div className="page-hero">
          <img src={heroImageUrl} alt={page.title?.ko ?? ''} className="page-hero-img" />
          {heroTagline && (
            <div className="page-hero-overlay">
              <p className="page-hero-tagline">{heroTagline}</p>
            </div>
          )}
        </div>
      )}

      <section className="dept-detail-body">
        <div className="wrap intro-layout">

          {/* Callout box */}
          {hasCallout && (
            <div className="intro-callout">
              {!heroImageUrl && (page.callout.tagline?.ko || page.callout.tagline?.en) && (
                <p className="intro-tagline">
                  {page.callout.tagline.ko || page.callout.tagline.en}
                </p>
              )}
              {(page.callout.message?.ko || page.callout.message?.en) && (
                <p className="intro-welcome">
                  {page.callout.message.ko || page.callout.message.en}
                </p>
              )}
            </div>
          )}

          {/* YouTube embed */}
          {page.youtubeUrl && (
            <div className="intro-video-wrap">
              <iframe
                src={page.youtubeUrl}
                title={page.title?.ko ?? 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="intro-video"
              />
            </div>
          )}

          {/* Ordered content sections */}
          {sections.map((section: any, i: number) => {
            if (section.blockType === 'richtext') {
              const hasKo = Boolean(section.text?.ko?.root?.children?.length)
              const hasEn = Boolean(section.text?.en?.root?.children?.length)
              return (
                <div key={i} className="intro-section">
                  {hasKo && (
                    <>
                      {hasEn && <div className="dept-lang-label">한국어</div>}
                      <div className="dept-prose">
                        <RichText data={section.text.ko} />
                      </div>
                    </>
                  )}
                  {hasEn && (
                    <div style={{ marginTop: hasKo ? 24 : 0 }}>
                      {hasKo && <div className="dept-lang-label" style={{ marginTop: 24 }}>English</div>}
                      <div className="dept-prose">
                        <RichText data={section.text.en} />
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            if (section.blockType === 'photoGrid') {
              const imgs: any[] = section.images ?? []
              if (!imgs.length) return null
              return (
                <div key={i} className="page-photo-grid">
                  {imgs.map((item: any, j: number) => {
                    const url = item.image?.url
                    if (!url) return null
                    return (
                      <div key={j} className="page-photo-item">
                        <img src={url} alt={item.image?.alt ?? ''} />
                      </div>
                    )
                  })}
                </div>
              )
            }

            return null
          })}

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
