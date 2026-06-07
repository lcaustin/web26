export default function Hero() {
  return (
    <div className="hero">
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <iframe
          src="https://www.youtube-nocookie.com/embed/EtKbsIubPJc?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1"
          // src="https://www.youtube-nocookie.com/embed/vXTVYrIjSBs?autoplay=1&mute=1&loop=1&playlist=vXTVYrIjSBs&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1"
          style={{
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
            zIndex: 0,
            opacity: 0.85,
          }}
          allow="autoplay;encrypted-media"
          frameBorder="0"
          title="Church worship background video"
        />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-eyebrow">Lord&apos;s Church of Austin · 어스틴 주님의교회</div>
        <div className="hero-title">
          예배의 감격으로 변화받아
          <br />
          열방을 섬기는 교회
        </div>
        <div className="hero-sub">Transformed by the Spirit of Worship to Serve the Nations</div>
        <div className="hero-btns">
          <button type="button" className="btn-primary">
            <i className="ti ti-player-play" aria-hidden="true" />
            이번 주 말씀 · This Week&apos;s Sermon
          </button>
          <button type="button" className="btn-outline">
            <i className="ti ti-map-pin" aria-hidden="true" />
            오시는 길 · Directions
          </button>
        </div>
      </div>
    </div>
  )
}
