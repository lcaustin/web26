import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'

export const dynamic = 'force-dynamic'

export default async function ServiceHoursPage() {
  const payload = await getPayload({ config })
  const [siteSettings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({ collection: 'service-times', limit: 100, sort: 'order' }).catch(() => ({ docs: [] })),
  ])
  const church = siteSettings?.church

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
            <div className="service-times-grid">
              {result.docs.map((service: any) => (
                <article className="service-time-card" key={service.id}>
                  <div className="service-time-icon"><i className="ti ti-clock" aria-hidden="true" /></div>
                  <div className="service-time-copy">
                    <h2>{service.name?.ko || service.name?.en}</h2>
                    {service.name?.ko && service.name?.en && <p className="service-time-en">{service.name.en}</p>}
                    <p className="service-time-value">{service.time}</p>
                    {service.location && <p className="service-time-location"><i className="ti ti-map-pin" aria-hidden="true" />{service.location}</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="dept-empty">예배시간을 준비하고 있습니다. · Service hours are being prepared.</p>}
        </div>
      </section>
      <Footer nameKo={church?.name?.ko} nameEn={church?.name?.en} addressKo={church?.address?.ko} phone={church?.phone} email={church?.email} />
    </div>
  )
}
