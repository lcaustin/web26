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
    sort: 'order,startDate',
    limit: 100,
  }).catch(() => ({ docs: [] }))

  const studies = (studiesResult.docs as any[]).filter((study) => study.active === true && study.semesterRef?.active === true)
  const courseTypesResult = await payload.find({
    collection: 'bible-study-course-types',
    sort: 'order',
    limit: 100,
  }).catch(() => ({ docs: [] }))
  const managedCourseTypes = courseTypesResult.docs as any[]

  // Fetch count of approved/pending signups for each active study
  const signupsCounts = await Promise.all(
    studies.map(async (study) => {
      const countResult = await payload.count({
        collection: 'bible-study-signups',
        where: {
          and: [
            { bibleStudy: { equals: study.id } },
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
  const managedSlugs = new Set(managedCourseTypes.map((type) => type.slug))
  const unlistedTypes = Array.from(new Set(studies.map((study) => study.courseType).filter((slug) => slug && !managedSlugs.has(slug))))
  const groups = [
    ...managedCourseTypes.map((type) => ({
    key: type.slug,
    titleKo: type.name?.ko || type.name?.en || type.slug,
    titleEn: type.name?.en || type.name?.ko || type.slug,
    items: studies.filter((study) => study.courseTypeRef?.id === type.id || study.courseTypeRef === type.id || study.courseType === type.slug).sort((a, b) => (a.order || 0) - (b.order || 0)),
    })),
    ...unlistedTypes.map((slug) => ({
      key: slug,
      titleKo: slug,
      titleEn: slug,
      items: studies.filter((study) => study.courseType === slug).sort((a, b) => (a.order || 0) - (b.order || 0)),
    })),
  ]
  const orderedStudies = groups.flatMap((group) => group.items)

  const renderStudyCard = (study: any) => {
    const count = countsMap.get(study.id) || 0
    const isFull = study.limit && count >= study.limit
    const effectiveStatus = isFull ? 'closed' : study.status
    const canSignUp = effectiveStatus === 'open'
    const startDateStr = study.startDate ? new Date(study.startDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : ''
    const managedCourseNameKo = study.courseTypeRef?.name?.ko || study.courseTypeRef?.name || ''
    const managedCourseNameEn = study.courseTypeRef?.name?.en || managedCourseNameKo
    const titlePartsKo = [study.semesterRef?.name, study.title?.ko || managedCourseNameKo, study.subject, study.targetGroup?.ko].filter(Boolean)
    const titlePartsEn = [study.semesterRef?.name, study.title?.en || managedCourseNameEn, study.subject, study.targetGroup?.en].filter(Boolean)

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
              className={`text-xs px-3 py-1 rounded-full font-bold ${isFull
                ? 'bg-red-500/10 text-red-500'
                : effectiveStatus === 'before'
                  ? 'bg-yellow-500/10 text-yellow-600'
                  : 'bg-green-500/10 text-green-500'
                }`}
            >
              {effectiveStatus === 'closed' ? '마감 · Full' : effectiveStatus === 'open' ? '신청 가능 · Open' : '신청 준비중 · Not Open'}
            </span>
            {study.limit ? (
              <span className="text-xs text-[var(--t2)] font-medium">
                정원 · Capacity: {study.limit}
              </span>
            ) : null}
          </div>

          {/* Group / Class Title */}
          <h3 className="text-lg font-bold mb-2">
          <span className="block text-[var(--t1)]">
              {titlePartsKo.join(' · ')}
            </span>
            {study.targetGroup.en && study.targetGroup.en !== study.targetGroup.ko && (
              <span className="block text-xs font-medium text-[var(--t2)] mt-1">
                {titlePartsEn.join(' · ')}
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
                <strong>장소 · Location:</strong> {study.location?.ko ? `${study.location.ko}${study.location.en ? ` (${study.location.en})` : ''}` : '줌미팅 · Zoom'}
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
          {!canSignUp ? (
            <span className="block w-full text-center py-2.5 bg-[var(--bdr)] text-[var(--t3)] rounded-full font-bold cursor-not-allowed text-sm">
              {effectiveStatus === 'closed' ? '마감되었습니다 · Full' : '신청 준비중 · Not Open Yet'}
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
            <>
              <div className="w-full overflow-hidden rounded-2xl border border-[var(--bdr)] bg-[var(--surf)]">
                <table className="w-full table-auto text-sm">
                  <caption className="sr-only">Bible study signup summary</caption>
                  <thead className="border-b border-[var(--bdr)] bg-[var(--bg-alt)] text-left text-xs uppercase tracking-wide text-[var(--t2)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold hidden sm:table-cell">Semester</th>
                      <th className="px-4 py-3 font-semibold">Course · Subject · Group</th>
                      <th className="px-4 py-3 font-semibold">Schedule</th>
                      <th className="px-4 py-3 font-semibold">Leader</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--bdr)]">
                    {orderedStudies.map((study) => {
                      const count = countsMap.get(study.id) || 0
                      const isFull = study.limit && count >= study.limit
                      const effectiveStatus = isFull ? 'closed' : study.status
                      const canSignUp = effectiveStatus === 'open'
                      const courseName = study.title?.ko || study.courseTypeRef?.name?.ko || study.courseTypeRef?.name || study.courseType
                      return (
                        <tr key={study.id} className="text-[var(--t1)]">
                          <td className="px-4 py-3 align-top whitespace-nowrap font-semibold hidden sm:table-cell">{study.semesterRef?.name || '—'}</td>
                          <td className="px-4 py-3 align-top font-semibold whitespace-normal break-words">{[courseName, study.subject, study.targetGroup?.ko].filter(Boolean).join(' · ') || '—'}</td>
                          <td className="px-4 py-3 align-top whitespace-normal break-words">{study.timeDescription?.ko || '—'}</td>
                          <td className="px-4 py-3 align-top whitespace-normal break-words">{study.instructor?.ko || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="space-y-12">
            {groups.map((group) => {
              if (group.items.length === 0) return null

              return (
                <div key={group.key} className="space-y-6">
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
            })}
              </div>
            </>
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
