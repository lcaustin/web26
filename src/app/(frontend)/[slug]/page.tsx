import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import SermonArchive, { type SermonArchiveItem } from '@/components/SermonArchive'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

const assetBaseUrl = (process.env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')

function normalizeAssetUrl(url?: string | null) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `${assetBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function pageVideoWhere(keyword?: string | null): Where | undefined {
  const q = keyword?.trim()
  if (!q) return undefined
  return {
    or: [
      { adminTitle: { contains: q } },
      { tags: { contains: q } },
      { description: { contains: q } },
    ],
  }
}

function missionRows(value?: string | null) {
  return (value ?? '')
    .split('\n')
    .map((row) => row.split('|').map((cell) => cell.trim()))
    .filter((cells) => cells.some(Boolean))
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
  const isTrainingPage = page.layout === 'training'
  const isMissionPage = page.slug === 'mission'
  const training = page.training ?? {}
  const mission = page.mission ?? {}

  const hasCallout =
    page.callout?.tagline?.ko ||
    page.callout?.tagline?.en ||
    page.callout?.message?.ko ||
    page.callout?.message?.en

  const heroImageUrl =
    normalizeAssetUrl(page.heroImage?.url as string | undefined) ??
    normalizeAssetUrl(page.heroImageUrl as string | undefined)

  const sections: any[] = page.sections ?? []
  const videoKeyword = training.videoSearchKeyword as string | undefined
  const videoResult = isTrainingPage && videoKeyword
    ? await payload.find({
      collection: 'videos',
      limit: 6,
      sort: '-publishedAt',
      where: pageVideoWhere(videoKeyword),
    }).catch(() => ({ docs: [] }))
    : { docs: [] }
  const trainingVideos = videoResult.docs.map((video: any): SermonArchiveItem => ({
    id: video.id,
    title: { ko: video.adminTitle, en: '' },
    date: video.publishedAt,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl,
  }))
  const trainingBody = typeof training.body === 'string'
    ? training.body.split(/\n{2,}/).map((paragraph: string) => paragraph.trim()).filter(Boolean)
    : []

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
          {page.icon && <div className="dept-detail-icon"><i className={`ti ${page.icon}`} aria-hidden="true" /></div>}
          <h1 className="dept-detail-ko">{page.title?.ko}</h1>
          {(page.subtitle?.ko || page.subtitle?.en) && (
            <div className="dept-detail-en">
              {page.subtitle?.en || page.subtitle?.ko}
            </div>
          )}
        </div>
      </header>

      {isMissionPage ? (
        <section className="dept-detail-body">
          <div className="wrap mission-page">
            {heroImageUrl && <img className="training-wide-banner" src={heroImageUrl} alt={page.title?.ko ?? ''} />}
            {training.body && <p className="mission-intro">{training.body}</p>}
            <section className="mission-section">
              <h2>해외선교</h2>
              <div className="mission-table-wrap">
                <table className="mission-table">
                  <tbody>{missionRows(mission.overseas).map((row, index) => (
                    <tr key={index}>{[0, 1, 2].map((column) => <td key={column}>{row[column] ?? ''}</td>)}</tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
            <section className="mission-section">
              <h2>단체 및 교회</h2>
              <div className="mission-table-wrap">
                <table className="mission-table">
                  <tbody>{missionRows(mission.partners).map((row, index) => (
                    <tr key={index}>{[0, 1].map((column) => <td key={column}>{row[column] ?? ''}</td>)}</tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      ) : isTrainingPage ? (
        <section className="dept-detail-body">
          <div className="wrap">
            {heroImageUrl && training.heroStyle === 'overlay' && (
              <div className="training-hero" style={{ backgroundImage: `url(${heroImageUrl})` }}>
                <div>
                  {training.heroTitle && <p>{training.heroTitle}</p>}
                  {training.heroSubtitle && <h2>{training.heroSubtitle}</h2>}
                </div>
              </div>
            )}

            {heroImageUrl && training.heroStyle === 'banner' && (
              <img className="training-wide-banner" src={heroImageUrl} alt={page.title?.ko ?? ''} />
            )}

            <section className="training-panel training-panel--center">
              {training.panelTitle && <p className="training-kicker">{training.panelTitle}</p>}
              {training.panelSubtitle && <p className="training-subkicker">{training.panelSubtitle}</p>}
              {training.showDivider && <div className="training-divider-mark" aria-hidden="true">|</div>}
              {heroImageUrl && training.heroStyle === 'feature' && (
                <img className="training-feature-image" src={heroImageUrl} alt={page.title?.ko ?? ''} />
              )}
              {trainingBody.length ? (
                <div className="training-prose">
                  {trainingBody.map((paragraph: string) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              ) : null}
              {training.registerUrl ? (
                <a className="training-register-link" href={training.registerUrl} target="_blank" rel="noopener noreferrer">
                  {training.registerLabel || '신청하기'} <i className="ti ti-external-link" aria-hidden="true" />
                </a>
              ) : training.closedMessage ? (
                <span className="training-closed">{training.closedMessage}</span>
              ) : null}
            </section>

            {trainingVideos.length ? (
              <section className="training-videos">
                <div className="training-section-head">
                  <div>
                    <h2>{training.videoTitle || '영상'}</h2>
                    {training.videoSubtitle && <p>{training.videoSubtitle}</p>}
                  </div>
                  <Link href={`/videos?q=${encodeURIComponent(videoKeyword ?? '')}`}>Show all · 더보기</Link>
                </div>
                <SermonArchive sermons={trainingVideos} label={training.videoArchiveLabel || `${page.title?.ko} · VIDEO`} />
              </section>
            ) : null}
          </div>
        </section>
      ) : (
        <>
      {/* Hero banner */}
      {heroImageUrl && (
        <div className="wrap">
          <div className="page-hero">
            <img src={heroImageUrl} alt={page.title?.ko ?? ''} className="page-hero-img" />
          </div>
        </div>
      )}

      <section className="dept-detail-body">
        <div className="wrap intro-layout">

          {/* Callout box */}
          {hasCallout && (
            <div className="intro-callout">
              {(page.callout.tagline?.ko || page.callout.tagline?.en) && (
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
        </>
      )}

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
