import config from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import type { Metadata } from 'next'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '성경공부 신청 · Bible Study Signup',
  description: '주님의교회 성경공부 및 훈련사역 신청 안내입니다.',
  alternates: { canonical: '/bible-studies' },
}

export default async function BibleStudiesPage() {
  const payload = await getPayload({ config })

  // Fetch active bible studies
  const studiesResult = await payload.find({
    collection: 'bible-studies',
    where: {
      status: { equals: 'active' },
    },
    sort: 'startDate',
    limit: 100,
  }).catch(() => ({ docs: [] }))

  const studies = studiesResult.docs as any[]

  // Fetch count of approved/pending signups for each active study
  const signupsCounts = await Promise.all(
    studies.map(async (study) => {
      const countResult = await payload.count({
        collection: 'bible-study-signups',
        where: {
          and: [
            { bibleStudy: { equals: study.id } },
            { status: { not_in: ['cancelled'] } },
          ],
        },
      }).catch(() => ({ totalDocs: 0 }))
      return { id: study.id, count: countResult.totalDocs }
    })
  )

  const countsMap = new Map(signupsCounts.map(item => [item.id, item.count]))

  const siteSettings = await payload.findGlobal({ slug: 'site-settings' }).catch(() => null)
  const church = siteSettings?.church

  // Group by Course Type
  const groups = {
    'coffee-break': {
      titleKo: '1. 커피브레이크 (소그룹 모임)',
      titleEn: 'Coffee Break Small Groups',
      items: studies.filter(s => s.courseType === 'coffee-break'),
    },
    'panorama': {
      titleKo: '2. 신구약 맥잡기',
      titleEn: 'Bible Panorama',
      items: studies.filter(s => s.courseType === 'panorama'),
    },
    'crown': {
      titleKo: '3. 크라운 재정교실',
      titleEn: 'Crown Financial Class',
      items: studies.filter(s => s.courseType === 'crown'),
    },
  }

  const renderStudyCard = (study: any) => {
    const count = countsMap.get(study.id) || 0
    const isFull = study.limit && count >= study.limit
    const startDateStr = study.startDate ? new Date(study.startDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : ''

    return (
      <div
        key={study.id}
        className="p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between"
        style={{
          background: 'var(--surf)',
          borderColor: 'var(--bdr)',
        }}
      >
        <div>
          {/* Status Header */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold ${
                isFull
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-green-500/10 text-green-500'
              }`}
            >
              {isFull ? '마감 · Full' : '신청 가능 · Open'}
            </span>
            {study.limit && (
              <span className="text-xs text-[var(--t2)] font-medium">
                정원 · Capacity: {count}/{study.limit}
              </span>
            )}
          </div>

          {/* Group / Class Title */}
          <h3 className="text-lg font-bold mb-2">
            <span className="block text-[var(--t1)]">
              {study.semester.ko} · {study.targetGroup.ko}
            </span>
            {study.targetGroup.en && study.targetGroup.en !== study.targetGroup.ko && (
              <span className="block text-xs font-medium text-[var(--t2)] mt-1">
                {study.semester.en} · {study.targetGroup.en}
              </span>
            )}
          </h3>

          <div className="space-y-2 mt-4 pt-4 border-t border-[var(--bdr)] text-sm text-[var(--t2)]">
            <div className="flex items-start gap-2">
              <i className="ti ti-user text-base mt-0.5" />
              <div>
                <strong>인도자/강사 · Leader:</strong> {study.instructor.ko} {study.instructor.en && `(${study.instructor.en})`}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <i className="ti ti-clock text-base mt-0.5" />
              <div>
                <strong>시간 · Time:</strong> {study.timeDescription.ko} {study.timeDescription.en && `(${study.timeDescription.en})`}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <i className="ti ti-map-pin text-base mt-0.5" />
              <div>
                <strong>장소 · Location:</strong> {study.location.ko} {study.location.en && `(${study.location.en})`}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <i className="ti ti-calendar text-base mt-0.5" />
              <div>
                <strong>개강일 · Start Date:</strong> {startDateStr}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4">
          {isFull ? (
            <span className="block w-full text-center py-2.5 bg-[var(--bdr)] text-[var(--t3)] rounded-full font-bold cursor-not-allowed text-sm">
              마감되었습니다 · Full
            </span>
          ) : (
            <Link
              href={`/bible-studies/${study.id}/signup`}
              className="block w-full text-center py-2.5 rounded-full font-bold transition-colors text-sm"
              style={{
                background: 'var(--gld)',
                color: 'var(--surf)',
              }}
            >
              신청하기 · Sign Up
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="site" id="site">
      <Nav />

      {/* Page Header */}
      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/" className="dept-back">
            <i className="ti ti-arrow-left" aria-hidden="true" />
            홈 · Home
          </Link>
          <div className="news-page-heading">
            <div className="news-page-title">
              <div className="dept-detail-icon"><i className="ti ti-book" aria-hidden="true" /></div>
              <div>
                <h1 className="dept-detail-ko">성경공부 신청</h1>
                <div className="dept-detail-en">Seasonal Bible Study Signup</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Body Content */}
      <section className="dept-detail-body">
        <div className="wrap space-y-12">
          {studies.length === 0 ? (
            <p className="dept-empty">
              현재 신청 가능한 성경공부가 없습니다. · No active bible studies open for signup at this time.
            </p>
          ) : (
            Object.entries(groups).map(([key, group]) => {
              if (group.items.length === 0) return null

              return (
                <div key={key} className="space-y-6">
                  <div className="border-b border-[var(--bdr)] pb-3">
                    <h2 className="text-2xl font-bold text-[var(--t1)]">
                      {group.titleKo}
                    </h2>
                    <p className="text-sm text-[var(--t2)] mt-1">
                      {group.titleEn}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.items.map(study => renderStudyCard(study))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      <Footer
        nameKo={church?.name?.ko}
        nameEn={church?.name?.en}
        addressKo={church?.address?.ko}
        phone={church?.phone}
        email={church?.email}
      />
    </div>
  )
}
