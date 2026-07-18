'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

type Photo = { url: string; alt: string }

export default function PhotoLightbox({ photos, trigger }: { photos: Photo[]; trigger?: ReactNode }) {
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    if (active === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
      if (event.key === 'ArrowLeft') setActive((current) => current === null ? null : (current - 1 + photos.length) % photos.length)
      if (event.key === 'ArrowRight') setActive((current) => current === null ? null : (current + 1) % photos.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, photos.length])

  const previous = () => setActive((current) => current === null ? null : (current - 1 + photos.length) % photos.length)
  const next = () => setActive((current) => current === null ? null : (current + 1) % photos.length)

  return (
    <>
      {trigger ? <button className="photo-lightbox-trigger" type="button" onClick={() => setActive(0)}>{trigger}</button> : <div className="photo-gallery">
        {photos.map((photo, index) => (
          <button className="photo-gallery-item" type="button" key={photo.url} onClick={() => setActive(index)}>
            <img src={photo.url} alt={photo.alt} loading={index < 6 ? 'eager' : 'lazy'} />
          </button>
        ))}
      </div>}

      {active !== null && (
        <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
          <button className="photo-lightbox-close" type="button" aria-label="Close photo viewer" onClick={() => setActive(null)}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
          {photos.length > 1 && <button className="photo-lightbox-nav photo-lightbox-nav--prev" type="button" aria-label="Previous photo" onClick={previous}>
            <i className="ti ti-chevron-left" aria-hidden="true" />
          </button>}
          <img className="photo-lightbox-image" src={photos[active].url} alt={photos[active].alt} />
          {photos.length > 1 && <button className="photo-lightbox-nav photo-lightbox-nav--next" type="button" aria-label="Next photo" onClick={next}>
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>}
          <div className="photo-lightbox-thumbnails" aria-label="Photo thumbnails">
            {photos.map((photo, index) => (
              <button className={index === active ? 'is-active' : ''} type="button" key={photo.url} onClick={() => setActive(index)} aria-label={'View photo ' + (index + 1)}>
                <img src={photo.url} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
