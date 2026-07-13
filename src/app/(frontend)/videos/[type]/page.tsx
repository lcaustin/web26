import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import SermonArchive, { type SermonArchiveItem } from '@/components/SermonArchive'

export const dynamic = 'force-dynamic'

const types: Record<string, { type: string; ko: string; en: string; icon: string }> = {
  'daily-devotion': { type: 'daily-devotion', ko: '매일말씀묵상', en: 'Daily Devotion', icon: 'ti-bible' },
  worship: { type: 'worship', ko: '예배실황', en: 'Worship Recordings', icon: 'ti-device-tv' },
  choir: { type: 'choir', ko: '성가대', en: 'Choir', icon: 'ti-music' },
  'offering-song': { type: 'offering-song', ko: '헌금송', en: 'Offering Song', icon: 'ti-music' },
  // Keep the previous URL working while the category uses its new name.
  'special-music': { type: 'offering-song', ko: '헌금송', en: 'Offering Song', icon: 'ti-music' },
  ministry: { type: 'ministry', ko: '부서 영상', en: 'Ministry Videos', icon: 'ti-users' },
  other: { type: 'other', ko: '영상', en: 'Videos', icon: 'ti-video' },
}

export default async function VideoTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type: slug } = await params
  const metadata = types[slug] || types.other
  const payload = await getPayload({ config })
  const [siteSettings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({ collection: 'videos', limit: 100, sort: '-publishedAt', where: { category: { equals: metadata.type } } }).catch(() => ({ docs: [] })),
  ])
  const videos = result.docs.map((video: any): SermonArchiveItem => ({
    id: video.id, title: { ko: video.adminTitle, en: '' }, date: video.publishedAt,
    videoUrl: video.videoUrl, thumbnailUrl: video.thumbnailUrl,
  }))
  const church = siteSettings?.church
  return <div className="site" id="site"><Nav />
    <header className="dept-detail-head"><div className="wrap"><Link href="/" className="dept-back"><i className="ti ti-arrow-left" aria-hidden="true" />홈 · Home</Link><div className="dept-detail-icon"><i className={metadata.icon} aria-hidden="true" /></div><h1 className="dept-detail-ko">{metadata.ko}</h1><div className="dept-detail-en">{metadata.en}</div></div></header>
    <section className="dept-detail-body"><div className="wrap">{videos.length ? <SermonArchive sermons={videos} label={`${metadata.ko} · ${metadata.en.toUpperCase()}`} /> : <p className="dept-empty">등록된 영상이 없습니다. · No videos have been added yet.</p>}</div></section>
    <Footer nameKo={church?.name?.ko} nameEn={church?.name?.en} addressKo={church?.address?.ko} phone={church?.phone} email={church?.email} />
  </div>
}
