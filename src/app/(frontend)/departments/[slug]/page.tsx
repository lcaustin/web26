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

  return (
    <div className="site" id="site">
      <Nav />

      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/#site" className="dept-back">
            <i className="ti ti-arrow-left" aria-hidden="true" />
            다음세대 · Next Generation
          </Link>

          <div className="dept-detail-icon">
            <i className={`ti ${dept.icon}`} aria-hidden="true" />
          </div>

          <h1 className="dept-detail-ko">{dept.name?.ko}</h1>
          <div className="dept-detail-en">{dept.name?.en}</div>
        </div>
      </header>

      <section className="dept-detail-body">
        <div className="wrap">
          <div className="dept-lang-block">
            <div className="dept-lang-label">한국어</div>
            {hasKo ? (
              <div className="dept-prose">
                <RichText data={ko} />
              </div>
            ) : (
              <p className="dept-empty">아직 등록된 한국어 소개가 없습니다.</p>
            )}
          </div>

          <div className="dept-lang-block">
            <div className="dept-lang-label">English</div>
            {hasEn ? (
              <div className="dept-prose">
                <RichText data={en} />
              </div>
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
