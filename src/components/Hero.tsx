'use client'

import { useEffect, useRef } from 'react'

// Rotate through these videos in order; the next one starts automatically
// as soon as the current one finishes, looping back to the first after the last.
const VIDEO_IDS = ['EtKbsIubPJc', 'pIdrtSqxPF4', 'fS1t0rJbOYk']

interface YouTubePlayer {
  getIframe: () => HTMLIFrameElement
  loadVideoById: (videoId: string) => void
  destroy: () => void
}

interface YouTubePlayerStateChangeEvent {
  data: number
  target: YouTubePlayer
}

interface YouTubePlayerReadyEvent {
  target: YouTubePlayer
}

interface YouTubeNamespace {
  Player: new (
    el: HTMLElement,
    options: {
      host?: string
      videoId?: string
      playerVars?: Record<string, number | string>
      events?: {
        onReady?: (event: YouTubePlayerReadyEvent) => void
        onStateChange?: (event: YouTubePlayerStateChangeEvent) => void
      }
    },
  ) => YouTubePlayer
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

const VIDEO_COVER_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '177.78vh',
  minWidth: '100%',
  height: '100%',
  minHeight: '56.25vw',
  transform: 'translate(-50%, -50%)',
  border: 'none',
  pointerEvents: 'none',
  zIndex: '0',
  opacity: '0.85',
}

const HERO_DEFAULTS = {
  taglineKo: '예배의 감격으로 변화받아\n열방을 섬기는 교회',
  taglineEn: 'Transformed by the Spirit of Worship to Serve the Nations',
  sermonButtonKo: '이번 주 말씀',
  sermonButtonEn: 'This Week’s Sermon',
  sermonButtonHref: '/sermons',
  directionsHref: 'https://www.google.com/maps/search/?api=1&query=11900%20Ranch%20Rd%20620%20N%2C%20Cedar%20Park%2C%20TX%2078613',
}

export default function Hero({
  taglineKo,
  taglineEn,
  sermonButtonKo,
  sermonButtonEn,
  sermonButtonHref,
  directionsHref,
}: {
  taglineKo?: string | null
  taglineEn?: string | null
  sermonButtonKo?: string | null
  sermonButtonEn?: string | null
  sermonButtonHref?: string | null
  directionsHref?: string | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    function playNext(player: YouTubePlayer) {
      indexRef.current = (indexRef.current + 1) % VIDEO_IDS.length
      player.loadVideoById(VIDEO_IDS[indexRef.current])
    }

    function createPlayer() {
      if (cancelled || !containerRef.current || !window.YT) return
      const player = new window.YT.Player(containerRef.current, {
        host: 'https://www.youtube-nocookie.com',
        videoId: VIDEO_IDS[0],
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            Object.assign(event.target.getIframe().style, VIDEO_COVER_STYLE)
          },
          onStateChange: (event) => {
            // YT.PlayerState.ENDED === 0
            if (event.data === 0) {
              playNext(event.target)
            }
          },
        },
      })
      playerRef.current = player
    }

    if (window.YT && window.YT.Player) {
      createPlayer()
    } else {
      const previousCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.()
        createPlayer()
      }
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(script)
      }
    }

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [])

  return (
    <div className="hero">
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div ref={containerRef} title="Church worship background video" />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-eyebrow">Lord&apos;s Church of Austin · 어스틴 주님의교회</div>
        <div className="hero-title">{taglineKo || HERO_DEFAULTS.taglineKo}</div>
        <div className="hero-sub">{taglineEn || HERO_DEFAULTS.taglineEn}</div>
        <div className="hero-btns">
          <a href={sermonButtonHref || HERO_DEFAULTS.sermonButtonHref} className="btn-primary">
            <i className="ti ti-player-play" aria-hidden="true" />
            {sermonButtonKo || HERO_DEFAULTS.sermonButtonKo} · {sermonButtonEn || HERO_DEFAULTS.sermonButtonEn}
          </a>
          <a href={directionsHref || HERO_DEFAULTS.directionsHref} className="btn-outline" target="_blank" rel="noopener noreferrer">
            <i className="ti ti-map-pin" aria-hidden="true" />
            오시는 길 · Directions
          </a>
        </div>
      </div>
    </div>
  )
}
