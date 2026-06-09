type QuickLink = {
  id: string | number
  name: { ko: string; en: string }
  icon: string
  href: string
}

const FALLBACK: QuickLink[] = [
  { id: 'f1', name: { ko: '매일말씀묵상', en: 'Daily QT' }, icon: 'ti-bible', href: '#' },
  { id: 'f2', name: { ko: '온라인 헌금안내', en: 'Online Giving' }, icon: 'ti-heart', href: '#' },
  { id: 'f3', name: { ko: '예배시간 안내', en: 'Service Times' }, icon: 'ti-clock', href: '/service-times' },
  { id: 'f4', name: { ko: '토요 골방기도', en: 'Saturday Closet Prayer' }, icon: 'ti-candle', href: '#' },
]

export default function QuickLinks({ items }: { items: QuickLink[] }) {
  const list = items.length ? items : FALLBACK

  return (
    <div className="resource-section">
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-title">
            바로가기 · <span style={{ fontWeight: 400, color: 'var(--t2)' }}>Quick Links</span>
          </span>
        </div>
        <div className="resource-grid">
          {list.map((item) => (
            <a key={item.id} href={item.href} className="resource-tile" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="resource-icon">
                <i className={`ti ${item.icon}`} aria-hidden="true" />
              </div>
              <div className="resource-ko">{item.name.ko}</div>
              <div className="resource-en">{item.name.en}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
