import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import StaffPhoto from './StaffPhoto'

export const dynamic = 'force-dynamic'

const staffAssetBaseUrl = (process.env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')

const groups = [
  { key: 'pastors', ko: '목사&협동목사', en: 'Pastors & Associate Pastors', roles: ['목사'] },
  { key: 'evangelists', ko: '전도사', en: 'Evangelists', roles: ['전도사'] },
  { key: 'ministry', ko: '간사 / 지휘자', en: 'Ministry Staff', roles: ['간사', '지휘자'], roleOrder: ['간사', '지휘자'] },
  { key: 'elders', ko: '장로', en: 'Elders', roles: ['장로'], statusOrder: ['원로', '은퇴', '시무', '협동'] },
  { key: 'kwonsa', ko: '권사', en: 'Senior Deaconess', roles: ['권사'], statusOrder: ['은퇴', '시무', '협동', '명예'] },
  { key: 'ordained-deacons', ko: '안수집사', en: 'Ordained Deacons', roles: ['안수집사'], statusOrder: ['시무', '협동'] },
]

const seniorPastorProfile = {
  imageUrl: `${staffAssetBaseUrl}/staff/senior-pastor-profile.jpg`,
  name: '허성현 담임목사',
  church: '주님의 교회 Lord’s Church of Austin',
  sections: [
    {
      title: '사역철학',
      items: ['예배의 감격으로 변화받아 열방을 섬기는 교회'],
    },
    {
      title: '사역전략',
      items: ['1. REACHING UP: 예배', '2. REACHING IN: 교제와 훈련', '3. REACHING OUT: 사역과 전도'],
    },
    {
      title: '프로필',
      items: [
        'D.Min (목회학박사) Midwestern Baptist Theological Seminary',
        'Th.M (신학석사) Fuller Theological Seminary',
        'M.Div (목회학석사) Talbot Theological Seminary',
        'BA. Keimyung University in Korea',
      ],
    },
  ],
}

function orderValue(value: unknown) {
  return typeof value === 'number' ? value : 0
}

function indexIn(order: string[], value?: string | null) {
  const index = order.indexOf(value || '')
  return index === -1 ? order.length : index
}

function memberRole(member: any) {
  const role = member.role?.ko || member.role?.en || ''
  return role
}

function memberStatus(member: any) {
  return member.status?.ko || member.status?.en || ''
}

function sortStaff(group: (typeof groups)[number]) {
  return (a: any, b: any) => {
    const aRole = memberRole(a)
    const bRole = memberRole(b)
    const aStatus = memberStatus(a)
    const bStatus = memberStatus(b)
    return indexIn(group.roleOrder || group.roles, aRole) - indexIn(group.roleOrder || group.roles, bRole)
    || indexIn(group.statusOrder || [], aStatus) - indexIn(group.statusOrder || [], bStatus)
    || orderValue(a.order) - orderValue(b.order)
    || orderValue(a.legacyIndex) - orderValue(b.legacyIndex)
    || String(a.name?.ko || a.name?.en || '').localeCompare(String(b.name?.ko || b.name?.en || ''), 'ko')
  }
}

export default async function StaffPage() {
  const payload = await getPayload({ config })
  const [siteSettings, staffResult] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({ collection: 'staff', limit: 100, depth: 1, sort: 'order,legacyIndex' }).catch(() => ({ docs: [] })),
  ])
  const church = siteSettings?.church
  const staffGroups = groups.map((group) => ({
    ...group,
    staff: staffResult.docs.filter((member: any) => group.roles.includes(memberRole(member))).sort(sortStaff(group)),
  })).filter((group) => group.staff.length)

  return (
    <div className="site" id="site">
      <Nav />
      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/" className="dept-back"><i className="ti ti-arrow-left" aria-hidden="true" />홈 · Home</Link>
          <div className="dept-detail-icon"><i className="ti ti-users" aria-hidden="true" /></div>
          <h1 className="dept-detail-ko">섬기는이</h1>
          <div className="dept-detail-en">Our Staff</div>
        </div>
      </header>
      <section className="dept-detail-body">
        <div className="wrap">
          <div className="staff-group-photo">
            <img src={`${staffAssetBaseUrl}/staff/staff-group.jpg`} alt="어스틴 주님의교회 섬기는이 단체 사진" />
          </div>
          <section className="senior-pastor">
            <div className="senior-pastor-photo">
              <img src={seniorPastorProfile.imageUrl} alt={seniorPastorProfile.name} />
            </div>
            <div className="senior-pastor-copy">
              <p className="senior-pastor-label">담임목사 · Senior Pastor</p>
              <h2>{seniorPastorProfile.name}</h2>
              <p className="senior-pastor-church">{seniorPastorProfile.church}</p>
              <div className="senior-pastor-details">
                {seniorPastorProfile.sections.map((section) => (
                  <div className="senior-pastor-block" key={section.title}>
                    <h3>{section.title}</h3>
                    {section.items.map((item) => <p key={item}>{item}</p>)}
                  </div>
                ))}
              </div>
            </div>
          </section>
          {staffGroups.length ? (
            <div className="staff-sections">
              {staffGroups.map((group) => (
                <section className="staff-section" key={group.key}>
                  <div className="staff-section-head"><h2>{group.ko}</h2><p>{group.en}</p></div>
                  <div className="staff-grid">
                    {group.staff.map((member: any) => {
                      const photo = typeof member.photo === 'object' ? member.photo : null
                      const imageUrl = photo?.url || member.imageUrl
                      const alt = photo?.alt || member.name?.en || member.name?.ko || ''
                      return (
                        <article className="staff-card" key={member.id}>
                          <StaffPhoto imageUrl={imageUrl} backImageUrl={member.backImageUrl} alt={alt} />
                          <div className="staff-copy">
                            <p className="staff-role">{member.role?.ko || member.role?.en}</p>
                            {member.role?.ko && member.role?.en && <p className="staff-role-en">{member.role.en}</p>}
                            <h3>{member.name?.ko || member.name?.en}</h3>
                            {member.name?.ko && member.name?.en && <p className="staff-name-en">{member.name.en}</p>}
                            {(member.status?.ko || member.status?.en) && <p className="staff-status">{member.status.ko || member.status.en}</p>}
                            {member.email && <a className="staff-email" href={`mailto:${member.email}`}><i className="ti ti-mail" aria-hidden="true" />{member.email}</a>}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : <p className="dept-empty">섬기는이 정보를 준비하고 있습니다. · Our staff directory is being prepared.</p>}
        </div>
      </section>
      <Footer nameKo={church?.name?.ko} nameEn={church?.name?.en} addressKo={church?.address?.ko} phone={church?.phone} email={church?.email} />
    </div>
  )
}
