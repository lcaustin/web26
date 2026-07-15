import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import chronicles from '@/data/chronicles.json'
import HistoryTimeline from './HistoryTimeline'

export const dynamic = 'force-dynamic'

type Chronicle = {
  _id?: { $oid?: string }
  start?: string
  title?: string
  year?: string
}

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  day: 'numeric',
  month: 'long',
})

function formatChronicleDate(start?: string) {
  if (!start) return ''
  const date = new Date(`${start}T00:00:00`)
  if (Number.isNaN(date.getTime())) return start
  return dateFormatter.format(date)
}

const historyGroups = (chronicles as Chronicle[])
  .filter((item) => item.year && item.title)
  .sort((a, b) => String(b.start || '').localeCompare(String(a.start || '')))
  .reduce<{ entries: Chronicle[], year: string }[]>((groups, item) => {
    const last = groups[groups.length - 1]
    if (last?.year === item.year) {
      last.entries.push(item)
    } else {
      groups.push({ year: item.year || '', entries: [item] })
    }
    return groups
  }, [])
  .map((group) => ({
    year: group.year,
    entries: group.entries.map((item) => ({
      id: item._id?.$oid || `${item.start}-${item.title}`,
      date: formatChronicleDate(item.start),
      title: item.title || '',
    })),
  }))

export default async function HistoryPage() {
  const payload = await getPayload({ config })
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' }).catch(() => null)
  const church = siteSettings?.church

  return (
    <div className="site" id="site">
      <Nav />
      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/" className="dept-back"><i className="ti ti-arrow-left" aria-hidden="true" />홈 · Home</Link>
          <div className="dept-detail-icon"><i className="ti ti-timeline-event" aria-hidden="true" /></div>
          <h1 className="dept-detail-ko">연혁</h1>
          <div className="dept-detail-en">주님의 교회가 걸어온 길</div>
        </div>
      </header>

      <section className="dept-detail-body">
        <div className="wrap">
          <div className="history-intro">
            <p className="history-kicker">Lord&apos;s Church of Austin</p>
            <h2>하나님이 인도하신 걸음을 기억합니다.</h2>
            <p>
              주님의 교회는 어스틴 지역에서 예배와 말씀, 다음세대와 선교의 사명을 붙들고 걸어왔습니다.
              아래 내용은 기존 연혁 데이터를 기준으로 정리했습니다.
            </p>
          </div>

          <HistoryTimeline groups={historyGroups} />
        </div>
      </section>

      <Footer nameKo={church?.name?.ko} nameEn={church?.name?.en} addressKo={church?.address?.ko} phone={church?.phone} email={church?.email} />
    </div>
  )
}
