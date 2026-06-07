import config from '@payload-config'
import { getPayload } from 'payload'

import Departments from '@/components/Departments'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import Nav from '@/components/Nav'
import QuickLinks from '@/components/QuickLinks'
import SermonAndNews from '@/components/SermonAndNews'
import WelcomeBanner from '@/components/WelcomeBanner'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [siteSettings, sermons, news, quickLinks, departments] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload
      .find({ collection: 'sermons', limit: 1, sort: '-date' })
      .then((r) => r.docs)
      .catch(() => []),
    payload
      .find({ collection: 'news', limit: 4, sort: '-date' })
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

      {banner?.enabled !== false && (
        <WelcomeBanner
          messageKo={banner?.message?.ko}
          messageEn={banner?.message?.en}
          registerLabelKo={banner?.registerLabel?.ko}
          registerLabelEn={banner?.registerLabel?.en}
          registerHref={banner?.registerHref}
        />
      )}

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
