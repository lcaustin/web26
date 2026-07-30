import config from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav'
import SignupForm from './SignupForm'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const payload = await getPayload({ config })
  const study = await payload.findByID({
    collection: 'bible-studies',
    id,
  }).catch(() => null)

  if (!study) return { title: '성경공부 신청 · Bible Study Signup' }
  return {
    title: `${study.title?.ko || 'Bible Study'}${study.subject ? ` · ${study.subject}` : ''} 신청 · Bible Study Signup`,
    description: `${study.title?.ko || 'Bible Study'} 온라인 신청 페이지입니다.`,
  }
}

export default async function BibleStudySignupPage({ params }: Props) {
  const { id } = await params
  const payload = await getPayload({ config })

  // Fetch the study
  const study: any = await payload.findByID({
    collection: 'bible-studies',
    id,
  }).catch(() => null)

  if (!study || study.status !== 'open') {
    notFound()
  }

  // Count existing signups to check capacity
  const countResult = await payload.count({
    collection: 'bible-study-signups',
    where: {
      and: [
        { bibleStudy: { equals: id } },
      ],
    },
  }).catch(() => ({ totalDocs: 0 }))

  const isFull = study.limit && countResult.totalDocs >= study.limit
  const canSignUp = study.status === 'open' && !isFull
  const startDateStr = study.startDate ? new Date(study.startDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : ''

  const siteSettings = await payload.findGlobal({ slug: 'site-settings' }).catch(() => null)
  const church = siteSettings?.church

  return (
    <div className="site" id="site">
      <Nav />

      {/* Page Header */}
      <header className="dept-detail-head">
        <div className="wrap">
          <Link href="/bible-studies" className="dept-back">
            <i className="ti ti-arrow-left" aria-hidden="true" />
            목록으로 · Back to List
          </Link>
          <div className="news-page-heading">
            <div className="news-page-title">
              <div className="dept-detail-icon"><i className="ti ti-edit" aria-hidden="true" /></div>
              <div>
                <h1 className="dept-detail-ko">{study.title.ko}{study.subject ? ` · ${study.subject}` : ''}</h1>
                {study.title.en && study.title.en !== study.title.ko && (
                  <div className="dept-detail-en">{study.title.en}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <section className="dept-detail-body">
        <div className="wrap max-w-3xl">
          <div className="space-y-6 mb-8 p-6 rounded-2xl border bg-[var(--bg-alt)] border-[var(--bdr)]">
            <h2 className="text-lg font-bold text-[var(--t1)]">과정 정보 · Course Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--t2)]">
              <div>
                <strong>개강일 · Start Date:</strong> {startDateStr}
              </div>
              <div>
                <strong>장소 · Location:</strong> {study.location.ko} {study.location.en && `(${study.location.en})`}
              </div>
              <div>
                <strong>시간 · Time:</strong> {study.timeDescription.ko} {study.timeDescription.en && `(${study.timeDescription.en})`}
              </div>
              {study.instructor?.ko && (
                <div>
                  <strong>강사 · Instructor:</strong> {study.instructor.ko} {study.instructor.en && `(${study.instructor.en})`}
                </div>
              )}
              {/* {study.limit && (
                <div>
                  <strong>정원 · Capacity:</strong> {countResult.totalDocs} / {study.limit}
                </div>
              )} */}
            </div>
          </div>

          {!canSignUp ? (
            <div className="p-8 rounded-2xl border text-center bg-red-500/10 border-red-500/20 text-red-500 font-bold my-8">
              {isFull
                ? '이 과정은 정원이 가득 차서 신청할 수 없습니다. · This course is fully booked.'
                : '아직 신청이 열리지 않았습니다. · Signup is not open yet.'}
            </div>
          ) : (
            <SignupForm
              studyId={study.id}
              studyTitleKo={study.title.ko}
              studyTitleEn={study.title.en}
            />
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
