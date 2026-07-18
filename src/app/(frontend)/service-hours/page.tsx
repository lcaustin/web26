import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'

export const dynamic = 'force-dynamic'
export const metadata = { title: '예배 안내', description: '어스틴 주님의교회 예배 시간과 모임 안내입니다.', alternates: { canonical: '/service-hours' } }

const serviceIcon = (name: string) => {
  if (name.includes('새벽')) return 'ti-sunrise'
  if (name.includes('금요')) return 'ti-music'
  if (name.includes('토요')) return 'ti-sparkles'
  if (name.includes('영아') || name.includes('유아')) return 'ti-baby-carriage'
  if (name.includes('가온')) return 'ti-school'
  if (name.includes('초등') || name.includes('중고등')) return 'ti-school'
  if (name.includes('대학')) return 'ti-school'
  if (name.includes('청년')) return 'ti-users-group'
  return 'ti-building-church'
}

const groups = [
  { key: 'sunday-worship', ko: '주일예배', en: 'Sunday Worship', icon: 'ti-building-church' },
  { key: 'weekday-worship', ko: '평일예배', en: 'Weekday Worship & Prayer', icon: 'ti-sunrise' },
  { key: 'next-generation', ko: '다음세대', en: 'Next Generation', icon: 'ti-users-group' },
]

export default async function ServiceHoursPage() {
  const payload = await getPayload({ config })
  const [siteSettings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({ collection: 'service-times', limit: 100, sort: 'order' }).catch(() => ({ docs: [] })),
  ])
  const church = siteSettings?.church
  const serviceGroups = groups.map((group) => ({
    ...group,
    services: result.docs.filter((service: any) => service.group === group.key),
  })).filter((group) => group.services.length)

  return (
    <div className="site" id="site">
      <Nav />
      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/" className="dept-back"><i className="ti ti-arrow-left" aria-hidden="true" />홈 · Home</Link>
          <div className="dept-detail-icon"><i className="ti ti-clock" aria-hidden="true" /></div>
          <h1 className="dept-detail-ko">예배시간 안내</h1>
          <div className="dept-detail-en">Service Hours</div>
        </div>
      </header>
      <section className="dept-detail-body">
        <div className="wrap">
          {result.docs.length ? (
            <div className="service-time-sections">
              {serviceGroups.map((group) => (
                <section className="service-time-section" key={group.key}>
                  <div className="service-time-section-head">
                    <i className={`ti ${group.icon}`} aria-hidden="true" />
                    <div><h2>{group.ko}</h2><p>{group.en}</p></div>
                  </div>
                  <div className="service-times-grid">
                    {group.services.map((service: any, index: number) => (
                      <article className="service-time-card" key={service.id}>
                        <div className="service-time-card-decor" aria-hidden="true" />
                        <span className="service-time-index">{String(index + 1).padStart(2, '0')}</span>
                        <div className="service-time-icon"><i className={`ti ${serviceIcon(service.name?.ko || '')}`} aria-hidden="true" /></div>
                        <div className="service-time-copy">
                          <h3>{service.name?.ko || service.name?.en}</h3>
                          {service.name?.ko && service.name?.en && <p className="service-time-en">{service.name.en}</p>}
                          <p className="service-time-value">{service.time}</p>
                          {service.location && <p className="service-time-location"><i className="ti ti-map-pin" aria-hidden="true" />{service.location}</p>}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : <p className="dept-empty">예배시간을 준비하고 있습니다. · Service hours are being prepared.</p>}
        </div>
      </section>
      <Footer nameKo={church?.name?.ko} nameEn={church?.name?.en} addressKo={church?.address?.ko} phone={church?.phone} email={church?.email} />
    </div>
  )
}
