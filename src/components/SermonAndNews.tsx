// Featured sermon video shown on the landing page's sermon card.
// Update this when a new sermon recording should be featured.
const SERMON_VIDEO_ID = 'brdV9aXCun8'
const SERMON_VIDEO_URL = `https://www.youtube.com/watch?v=${SERMON_VIDEO_ID}`
const SERMON_VIDEO_THUMB = `https://img.youtube.com/vi/${SERMON_VIDEO_ID}/maxresdefault.jpg`

type Sermon = {
  title: { ko: string; en: string }
  preacher?: { ko?: string | null; en?: string | null } | null
  date: string
}

type NewsItem = {
  id: string | number
  title: { ko: string; en: string }
  date: string
}

type Props = {
  sermon: Sermon | null
  news: NewsItem[]
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export default function SermonAndNews({ sermon, news }: Props) {
  return (
    <section>
      <div className="wrap">
        <div className="two-col">
          <div>
            <div className="sec-head">
              <span className="sec-title">
                설교 · <span style={{ fontWeight: 400, color: 'var(--t2)' }}>Sermon</span>
              </span>
              <a className="view-all" href="#">
                전체 보기 View All →
              </a>
            </div>
            <div className="sermon-card">
              <a
                className="sermon-thumb"
                href={SERMON_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch this week's sermon on YouTube"
                style={{
                  display: 'block',
                  background: `#120d24 url(${SERMON_VIDEO_THUMB}) center / cover no-repeat`,
                }}
              >
                <div className="play-overlay">
                  <div className="play-btn-c">
                    <i className="ti ti-player-play" aria-hidden="true" />
                  </div>
                </div>
              </a>
              <div className="sermon-body">
                <div className="sermon-tag">주일 설교 · SUNDAY SERMON</div>
                {sermon ? (
                  <>
                    <div className="sermon-title">
                      {sermon.title.ko}
                      <br />
                      <span style={{ fontWeight: 400, color: 'var(--t2)', fontSize: 12 }}>
                        {sermon.title.en}
                      </span>
                    </div>
                    <div className="sermon-meta">
                      {formatDate(sermon.date)}
                      {sermon.preacher?.ko ? ` · 담임목사 ${sermon.preacher.ko}` : ''}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sermon-title">
                      하나님의 사랑 안에 거하라
                      <br />
                      <span style={{ fontWeight: 400, color: 'var(--t2)', fontSize: 12 }}>
                        Abide in the Love of God
                      </span>
                    </div>
                    <div className="sermon-meta">2025.05.11 · 담임목사 홍길동</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="sec-head">
              <span className="sec-title">
                소식 · <span style={{ fontWeight: 400, color: 'var(--t2)' }}>News</span>
              </span>
              <a className="view-all" href="#">
                전체 보기 View All →
              </a>
            </div>
            <div className="news-card">
              <div className="news-list">
                {news.map((item) => (
                  <div className="news-item" key={item.id}>
                    <div className="news-accent" />
                    <div className="news-info">
                      <div className="news-title">
                        {item.title.ko}
                        <br />
                        <span style={{ fontWeight: 400, color: 'var(--t2)', fontSize: 11 }}>
                          {item.title.en}
                        </span>
                      </div>
                      <div className="news-date">{formatDate(item.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
