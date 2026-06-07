type Department = {
  id: string | number
  name: { ko: string; en: string }
  icon: string
  href?: string | null
}

const FALLBACK: Department[] = [
  { id: 'f1', name: { ko: '영아부', en: 'Nursery' }, icon: 'ti-baby-carriage' },
  { id: 'f2', name: { ko: '유아부', en: 'Preschool' }, icon: 'ti-mood-kid' },
  { id: 'f3', name: { ko: '초등부', en: 'Elementary' }, icon: 'ti-school' },
  { id: 'f4', name: { ko: '중고등부', en: 'Youth' }, icon: 'ti-backpack' },
  { id: 'f5', name: { ko: '대학청년부', en: 'College & Young Adult' }, icon: 'ti-users' },
  { id: 'f6', name: { ko: 'EM', en: 'English Ministry' }, icon: 'ti-world' },
  { id: 'f7', name: { ko: '에노스', en: 'Enos (Senior)' }, icon: 'ti-user-circle' },
  { id: 'f8', name: { ko: '가온학교', en: 'Gaon School' }, icon: 'ti-book' },
]

const Tile = ({ dept }: { dept: Department }) => {
  const inner = (
    <>
      <div className="dept-icon">
        <i className={`ti ${dept.icon}`} aria-hidden="true" />
      </div>
      <div className="dept-ko">{dept.name.ko}</div>
      <div className="dept-en">{dept.name.en}</div>
    </>
  )

  if (dept.href) {
    return (
      <a href={dept.href} className="dept-tile" style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </a>
    )
  }

  return <div className="dept-tile">{inner}</div>
}

export default function Departments({ items }: { items: Department[] }) {
  const list = items.length ? items : FALLBACK
  const rows = [list.slice(0, 4), list.slice(4, 8)].filter((row) => row.length)

  return (
    <section className="dept-section">
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-title">
            다음세대 · <span style={{ fontWeight: 400, color: 'var(--t2)' }}>Next Generation</span>
          </span>
        </div>
        {rows.map((row, i) => (
          <div className="dept-row" key={i}>
            {row.map((dept) => (
              <Tile dept={dept} key={dept.id} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
