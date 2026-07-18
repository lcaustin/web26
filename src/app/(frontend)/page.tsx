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

const CHURCH_TIME_ZONE = 'America/Chicago'

function churchDate(value: Date | string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CHURCH_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value))
  const get = (type: string) => parts.find((part) => part.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

function isChurchWeekday(now: Date) {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: CHURCH_TIME_ZONE, weekday: 'short' }).format(now)
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday)
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  const now = new Date()
  const today = now.toISOString()
  const todayInChurchTime = churchDate(now)
  const weekdayInChurchTime = isChurchWeekday(now)

  const [siteSettings, sermons, dailyDevotions, news, events, quickLinks, departments] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload
      .find({ collection: 'videos', limit: 1, sort: '-publishedAt', where: { category: { equals: 'sermon' } } })
      .then((r) => r.docs)
      .catch(() => []),
    weekdayInChurchTime
      ? payload
        .find({ collection: 'videos', limit: 15, sort: '-publishedAt', where: { category: { equals: 'daily-devotion' } } })
        .then((r) => r.docs)
        .catch(() => [])
      : Promise.resolve([]),
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
  const hero = siteSettings?.hero
  const church = siteSettings?.church
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(church?.address?.ko || '11900 Ranch Rd 620 N, Cedar Park, TX 78613')}`
  const hasTodayDailyDevotion = dailyDevotions.some((video: any) => video.publishedAt && churchDate(video.publishedAt) === todayInChurchTime)
  const automaticSermonButtonHref = hasTodayDailyDevotion ? '/videos/daily-devotion' : '/sermons'
  const automaticSermonButtonKo = weekdayInChurchTime ? '오늘의 매일말씀묵상' : '지난 주일설교'
  const automaticSermonButtonEn = weekdayInChurchTime ? "Today's daily devotion" : 'Sunday sermon'
  const sermonButtonHref = hero?.sermonButtonHref?.trim() || automaticSermonButtonHref
  const sermonButtonKo = hero?.sermonButtonLabel?.ko?.trim() || automaticSermonButtonKo
  const sermonButtonEn = hero?.sermonButtonLabel?.en?.trim() || automaticSermonButtonEn

  return (
    <div className="site" id="site">
      <h2 className="sr-only">
        Lord&apos;s Church of Austin — landing page
      </h2>

      <Nav />
      <Hero
        taglineKo={hero?.tagline?.ko}
        taglineEn={hero?.tagline?.en}
        sermonButtonKo={sermonButtonKo}
        sermonButtonEn={sermonButtonEn}
        sermonButtonHref={sermonButtonHref}
        directionsHref={directionsHref}
      />

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
                title: { ko: sermons[0].adminTitle, en: '' },
                date: sermons[0].publishedAt,
                videoUrl: sermons[0].videoUrl,
                thumbnailUrl: sermons[0].thumbnailUrl,
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
