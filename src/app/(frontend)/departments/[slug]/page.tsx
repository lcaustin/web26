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

type DepartmentEntry = {
  label?: string
  value: string
}

const assetBaseUrl = (process.env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')

function assetUrl(value?: string | null) {
  if (!value) return null
  return /^https?:\/\//i.test(value) ? value : `${assetBaseUrl}${value.startsWith('/') ? '' : '/'}${value}`
}

function youtubeEmbedUrl(value?: string | null) {
  if (!value) return null
  if (value.includes('/embed/')) return value
  try {
    const url = new URL(value)
    const id = url.searchParams.get('v') ?? (url.hostname === 'youtu.be' ? url.pathname.slice(1) : null)
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : value
  } catch {
    return null
  }
}

function nodeText(node: any): string {
  if (node?.type === 'linebreak') return '\n'
  if (typeof node?.text === 'string') return node.text
  return Array.isArray(node?.children) ? node.children.map(nodeText).join('') : ''
}

function departmentEntries(data: any): DepartmentEntry[] | null {
  const children = data?.root?.children
  if (!Array.isArray(children) || !children.length || !children.every((node) => node.type === 'paragraph')) return null

  const entries = children.map((paragraph) => {
    const nodes = paragraph.children ?? []
    const first = nodes[0]
    const hasLabel = first?.type === 'text' && (first.format & 1) === 1
    const label = hasLabel ? nodeText(first).replace(/:\s*$/, '').trim() : undefined
    const value = nodeText(hasLabel ? { children: nodes.slice(1) } : paragraph).trim()
    return { label, value }
  }).filter((entry) => entry.value || entry.label)

  return entries.some((entry) => entry.label) ? entries : null
}

function DepartmentLanguageContent({ data }: { data: any }) {
  const entries = departmentEntries(data)

  if (!entries) {
    return <div className="dept-prose"><RichText data={data} /></div>
  }

  return (
    <div className="dept-info-grid">
      {entries.map((entry, index) => (
        <article key={`${entry.label ?? 'statement'}-${index}`} className={`dept-info-card${entry.label ? '' : ' dept-info-card--statement'}`}>
          {entry.label && <h3>{entry.label}</h3>}
          {entry.value && <p>{entry.value}</p>}
        </article>
      ))}
    </div>
  )
}

export default async function DepartmentDetailPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const [siteSettings, deptResult] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload
      .find({ collection: 'departments', where: { slug: { equals: slug } }, limit: 1 })
      .catch(() => ({ docs: [] })),
  ])

  const dept = deptResult.docs[0]
  if (!dept) notFound()

  const church = siteSettings?.church

  const ko = dept.description?.ko
  const en = dept.description?.en
  const hasKo = Boolean(ko?.root?.children?.length)
  const hasEn = Boolean(en?.root?.children?.length)
  const heroImageUrl = assetUrl(dept.heroImageUrl)
  const youtubeUrl = youtubeEmbedUrl(dept.youtubeUrl)

  return (
    <div className="site" id="site">
      <Nav />

      <header className="dept-detail-head dept-detail-head--department">
        <div className="wrap">
          <Link href="/#site" className="dept-back">
            <i className="ti ti-arrow-left" aria-hidden="true" />
            다음세대 · Next Generation
          </Link>

          <div className="dept-department-title">
            <div className="dept-detail-icon">
              <i className={`ti ${dept.icon}`} aria-hidden="true" />
            </div>
            <div>
              <p>다음세대 · NEXT GENERATION</p>
              <h1 className="dept-detail-ko">{dept.name?.ko}</h1>
              <div className="dept-detail-en">{dept.name?.en}</div>
            </div>
          </div>
        </div>
      </header>

      {heroImageUrl && (
        <section className="dept-hero" style={{ backgroundImage: `url(${heroImageUrl})` }}>
          <div className="dept-hero-overlay">
            {dept.heroTitle && <h2>{dept.heroTitle}</h2>}
            {dept.heroSubtitle && <p>{dept.heroSubtitle}</p>}
          </div>
        </section>
      )}

      <section className="dept-detail-body dept-detail-body--department">
        <div className="wrap dept-language-grid">
          {youtubeUrl && (
            <section className="dept-intro-video">
              <div className="dept-language-heading">
                <div className="dept-lang-label">소개 영상</div>
                <span>INTRODUCTION VIDEO</span>
              </div>
              <div className="dept-video-frame">
                <iframe
                  src={youtubeUrl}
                  title={`${dept.name?.ko ?? dept.name?.en ?? 'Department'} introduction video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}
          <div className="dept-lang-block">
            <div className="dept-language-heading">
              <div className="dept-lang-label">한국어</div>
              <span>Korean</span>
            </div>
            {hasKo ? (
              <DepartmentLanguageContent data={ko} />
            ) : (
              <p className="dept-empty">아직 등록된 한국어 소개가 없습니다.</p>
            )}
          </div>

          <div className="dept-lang-block">
            <div className="dept-language-heading">
              <div className="dept-lang-label">English</div>
              <span>English</span>
            </div>
            {hasEn ? (
              <DepartmentLanguageContent data={en} />
            ) : (
              <p className="dept-empty">No English description has been added yet.</p>
            )}
          </div>
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
