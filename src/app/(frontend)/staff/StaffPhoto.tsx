'use client'

import { useState } from 'react'

type StaffPhotoProps = {
  alt: string
  backImageUrl?: string | null
  imageUrl?: string | null
}

export default function StaffPhoto({ alt, backImageUrl, imageUrl }: StaffPhotoProps) {
  const [isBackVisible, setIsBackVisible] = useState(false)

  if (!imageUrl) {
    return (
      <div className="staff-photo">
        <i className="ti ti-user" aria-label="Portrait pending" />
      </div>
    )
  }

  if (!backImageUrl) {
    return (
      <div className="staff-photo">
        <img className="staff-photo-image" src={imageUrl} alt={alt} />
      </div>
    )
  }

  return (
    <button
      type="button"
      className={`staff-photo staff-photo-button${isBackVisible ? ' is-back' : ''}`}
      aria-label={`${alt || 'Staff portrait'} front/back photo`}
      aria-pressed={isBackVisible}
      onClick={() => setIsBackVisible((value) => !value)}
    >
      <img className="staff-photo-image" src={imageUrl} alt={alt} />
      <img className="staff-photo-image staff-photo-back" src={backImageUrl} alt="" aria-hidden="true" />
    </button>
  )
}
