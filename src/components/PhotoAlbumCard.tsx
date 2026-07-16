'use client'

import Link from 'next/link'
import PhotoLightbox from './PhotoLightbox'

type Album = { id: number | string; slug: string; title: string; imageCount: number; coverUrl: string | null }

function CardContent({ album }: { album: Album }) {
  return <>
    <div className="photo-album-cover">{album.coverUrl ? <img src={album.coverUrl} alt="" /> : <i className="ti ti-photo" aria-hidden="true" />}</div>
    <div className="photo-album-copy"><h2>{album.title}</h2>{album.imageCount > 1 && <p>{album.imageCount} photos</p>}</div>
  </>
}

export default function PhotoAlbumCard({ album }: { album: Album }) {
  if (album.imageCount === 1 && album.coverUrl) {
    return <PhotoLightbox photos={[{ url: album.coverUrl, alt: album.title }]} trigger={<span className="photo-album-card"><CardContent album={album} /></span>} />
  }
  return <Link className="photo-album-card" href={'/photos/' + album.slug}><CardContent album={album} /></Link>
}
