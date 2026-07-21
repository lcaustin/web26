'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// Rotate through these videos in order; the next one starts automatically
// as soon as the current one finishes, looping back to the first after the last.
const DEFAULT_VIDEO_IDS = ['EtKbsIubPJc', 'pIdrtSqxPF4', 'fS1t0rJbOYk']

function shuffleVideoIds(videoIds: string[]) {
  const shuffled = [...videoIds]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentVideoId = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = currentVideoId
  }

  return shuffled
}

const titleContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.18, staggerChildren: 0.09 } },
}

const titleWordVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(8px)', y: 14 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const AURORA_WORDS = new Set(['예배', '감격', '변화', '열방', '교회'])
const AURORA_WORD_PATTERN = /(예배|감격|변화|열방|교회)/g
const DEFAULT_AURORA_WORD_TONES: Record<string, string> = {
  예배: 'worship',
  감격: 'wonder',
  변화: 'change',
  열방: 'nations',
  교회: 'church',
}
const AURORA_TONES = Object.values(DEFAULT_AURORA_WORD_TONES)

function shuffledAuroraTones() {
  const tones = [...AURORA_TONES]

  for (let index = tones.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentTone = tones[index]
    tones[index] = tones[randomIndex]
    tones[randomIndex] = currentTone
  }

  return Object.fromEntries([...AURORA_WORDS].map((word, index) => [word, tones[index]]))
}

function renderTitleWord(word: string, auroraWordTones: Record<string, string>) {
  return word.split(AURORA_WORD_PATTERN).filter(Boolean).map((part, index) => (
    AURORA_WORDS.has(part)
      ? <span key={`${part}-${index}`} className={`hero-title-aurora hero-title-aurora--${auroraWordTones[part]}`}>{part}</span>
      : part
  ))
}

function HeroTitle({ value }: { value: string }) {
  const reducedMotion = useReducedMotion()
  const [auroraWordTones, setAuroraWordTones] = useState(DEFAULT_AURORA_WORD_TONES)
  const lines = value.split('\n')

  useEffect(() => {
    setAuroraWordTones(shuffledAuroraTones())
  }, [])

  return (
    <motion.h1
      className="hero-title"
      initial={reducedMotion ? false : 'hidden'}
      animate={reducedMotion ? undefined : 'visible'}
      variants={titleContainerVariants}
    >
      {lines.map((line, lineIndex) => <span key={`line-${lineIndex}`} className="hero-title-line">
        {line.split(/\s+/).filter(Boolean).map((word, wordIndex) => <motion.span key={`${lineIndex}-${wordIndex}`} className="hero-title-word" variants={titleWordVariants}>{renderTitleWord(word, auroraWordTones)}</motion.span>)}
        {lineIndex < lines.length - 1 && <br />}
      </span>)}
    </motion.h1>
  )
}

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
}

export default function Hero({
  taglineKo,
  taglineEn,
  sermonButtonKo,
  sermonButtonEn,
  sermonButtonHref,
  backgroundVideoIds,
}: {
  taglineKo?: string | null
  taglineEn?: string | null
  sermonButtonKo?: string | null
  sermonButtonEn?: string | null
  sermonButtonHref?: string | null
  backgroundVideoIds?: string[] | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const indexRef = useRef(0)
  const playlistKey = backgroundVideoIds?.filter(Boolean).join('|') || DEFAULT_VIDEO_IDS.join('|')

  useEffect(() => {
    let cancelled = false
    indexRef.current = 0
    const videoIds = shuffleVideoIds(playlistKey.split('|'))

    function playNext(player: YouTubePlayer) {
      indexRef.current = (indexRef.current + 1) % videoIds.length
      player.loadVideoById(videoIds[indexRef.current])
    }

    function createPlayer() {
      if (cancelled || !containerRef.current || !window.YT) return
      const player = new window.YT.Player(containerRef.current, {
        host: 'https://www.youtube-nocookie.com',
        videoId: videoIds[0],
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
  }, [playlistKey])

  return (
    <div className="hero">
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div ref={containerRef} title="Church worship background video" />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <HeroTitle value={taglineKo || HERO_DEFAULTS.taglineKo} />
        <p className="hero-sub">{taglineEn || HERO_DEFAULTS.taglineEn}</p>
        <div className="hero-btns">
          <a href={sermonButtonHref || HERO_DEFAULTS.sermonButtonHref} className="btn-primary">
            <i className="ti ti-player-play" aria-hidden="true" />
            {sermonButtonKo || HERO_DEFAULTS.sermonButtonKo} · {sermonButtonEn || HERO_DEFAULTS.sermonButtonEn}
          </a>
        </div>
      </div>
    </div>
  )
}
