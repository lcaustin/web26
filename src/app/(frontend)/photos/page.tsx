import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import VideoPagination from '@/components/VideoPagination'
import PhotoAlbumCard from '@/components/PhotoAlbumCard'

export const dynamic = 'force-dynamic'

const base = (process.env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')
const imageUrl = (url?: string | null) => {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return url
  return base + '/' + url.replace(/^\/+/, '')
}

export default async function PhotosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1)
  const payload = await getPayload({ config })
  const [siteSettings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({ collection: 'photo-albums', page, limit: 15, sort: '-eventDate' }).catch(() => ({ docs: [], page: 1, totalPages: 1 })),
  ])

  return <div className="site" id="site"><Nav />
    <header className="dept-detail-head"><div className="wrap">
      <Link href="/" className="dept-back"><i className="ti ti-arrow-left" aria-hidden="true" />홈 · Home</Link>
      <div className="dept-detail-icon"><i className="ti ti-photo" aria-hidden="true" /></div>
      <h1 className="dept-detail-ko">사진</h1><div className="dept-detail-en">Photos</div>
    </div></header>
    <section className="dept-detail-body"><div className="wrap">
      {result.docs.length ? <div className="photo-album-grid">{result.docs.map((album: any) => {
        const cover = imageUrl(album.coverImageUrl)
        return <PhotoAlbumCard key={album.id} album={{ id: album.id, slug: album.slug, title: album.title, imageCount: Number(album.imageCount ?? 0), coverUrl: cover }} />
      })}</div> : <p className="dept-empty">사진 앨범을 불러오는 중입니다.</p>}
      <VideoPagination currentPage={result.page ?? 1} totalPages={result.totalPages ?? 1} basePath="/photos" />
    </div></section>
    <Footer nameKo={siteSettings?.church?.name?.ko} nameEn={siteSettings?.church?.name?.en} addressKo={siteSettings?.church?.address?.ko} phone={siteSettings?.church?.phone} email={siteSettings?.church?.email} />
  </div>
}
