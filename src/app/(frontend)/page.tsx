import config from '@payload-config'
import { getPayload } from 'payload'

import Departments from '@/components/Departments'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import Nav from '@/components/Nav'
import QuickLinks from '@/components/QuickLinks'
import SermonAndNews from '@/components/SermonAndNews'
import SpecialEvent from '@/components/SpecialEvent'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const today = new Date().toISOString()

  const [siteSettings, sermons, news, events, quickLinks, departments] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload
      .find({ collection: 'sermons', limit: 1, sort: '-date' })
      .then((r) => r.docs)
      .catch(() => []),
    payload
      .find({ collection: 'news', limit: 4, sort: '-date' })
      .then((r) => r.docs)
      .catch(() => []),
    // Special events: news items with both startDate and endDate set, endDate >= today
    payload
      .find({
        collection: 'news',
        limit: 20,
        sort: 'eventDates.startDate',
        where: {
          and: [
            { 'eventDates.startDate': { exists: true } },
            { 'eventDates.endDate': { exists: true } },
            { 'eventDates.endDate': { greater_than_equal: today } },
          ],
        },
      })
      .then((r) => r.docs)
      .catch(() => []),
    payload
      .find({ collection: 'quick-links', limit: 12, sort: 'order' })
      .then((r) => r.docs)
      .catch(() => []),
    payload
      .find({ collection: 'departments', limit: 12, sort: 'order' })
      .then((r) => r.docs)
      .catch(() => []),
  ])

  const banner = siteSettings?.welcomeBanner
  const church = siteSettings?.church

  return (
    <div className="site" id="site">
      <h2 className="sr-only">
        Lord&apos;s Church of Austin — landing page
      </h2>

      <Nav />
      <Hero />

      <SpecialEvent
        events={events
          .filter((e: any) => e.eventDates?.startDate && e.eventDates?.endDate)
          .map((e: any) => ({
            id: e.id,
            slug: e.slug ?? null,
            title: { ko: e.title?.ko ?? null, en: e.title?.en ?? null },
            startDate: e.eventDates.startDate,
            endDate: e.eventDates.endDate,
            link: e.link ?? null,
          }))}
        welcome={{
          messageKo: banner?.message?.ko,
          messageEn: banner?.message?.en,
          registerLabelKo: banner?.registerLabel?.ko,
          registerLabelEn: banner?.registerLabel?.en,
          registerHref: banner?.registerHref,
        }}
      />

      <SermonAndNews
        sermon={
          sermons[0]
            ? {
                title: sermons[0].title,
                preacher: sermons[0].preacher,
                date: sermons[0].date,
              }
            : null
        }
        news={news.map((item) => ({ id: item.id, title: item.title, date: item.date }))}
      />

      <QuickLinks
        items={quickLinks.map((link) => ({
          id: link.id,
          name: link.name,
          icon: link.icon,
          href: link.href,
        }))}
      />

      <Departments
        items={departments.map((dept) => ({
          id: dept.id,
          name: dept.name,
          icon: dept.icon,
          href: dept.href,
        }))}
      />

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
