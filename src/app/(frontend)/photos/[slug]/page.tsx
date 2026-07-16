import config from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import PhotoLightbox from '@/components/PhotoLightbox'

export const dynamic = 'force-dynamic'

const base = (process.env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')
const imageUrl = (url?: string | null) => {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  return base + '/' + url.replace(/^\/+/, '')
}

export default async function PhotoAlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const [siteSettings, albumResult] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({ collection: 'photo-albums', where: { slug: { equals: slug } }, limit: 1 }).catch(() => ({ docs: [] })),
  ])
  const album: any = albumResult.docs[0]
  if (!album) notFound()
  const photoResult = await payload.find({
    collection: 'photo-items',
    where: { album: { equals: album.id } },
    limit: 500,
    sort: 'sortOrder',
  }).catch(() => ({ docs: [] }))

  return (
    <div className="site" id="site">
      <Nav />
      <header className="dept-detail-head"><div className="wrap">
        <Link href="/photos" className="dept-back"><i className="ti ti-arrow-left" aria-hidden="true" />사진 · Photos</Link>
        <h1 className="dept-detail-ko">{album.title}</h1>
        <div className="dept-detail-en">{album.imageCount ?? photoResult.docs.length} Photos</div>
      </div></header>
      <section className="dept-detail-body"><div className="wrap photo-album-detail">
        {album.description && <p className="photo-album-description">{album.description}</p>}
        <PhotoLightbox photos={photoResult.docs.map((photo: any, index: number) => ({
          url: imageUrl(photo.imageUrl),
          alt: album.title + ' photo ' + (index + 1),
        }))} />
      </div></section>
      <Footer nameKo={siteSettings?.church?.name?.ko} nameEn={siteSettings?.church?.name?.en} addressKo={siteSettings?.church?.address?.ko} phone={siteSettings?.church?.phone} email={siteSettings?.church?.email} />
    </div>
  )
}
