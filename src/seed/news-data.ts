// Sample 소식 (News / Announcements) seed data — bilingual KO/EN.
// Used by the one-time seeding route at /api/seed-news (see route.ts in
// src/app/(frontend)/api/seed-news/) so it runs through Next.js's own
// module resolution instead of the Payload CLI's script loader.

export type SeedNewsItem = {
  title: { ko: string; en: string }
  date: string
  link?: string
}

export const newsSeedItems: SeedNewsItem[] = [
  {
    title: {
      ko: '2026년 여름 수련회 신청 안내',
      en: '2026 Summer Retreat Registration Now Open',
    },
    date: '2026-06-01',
    link: '/news/summer-retreat-2026',
  },
  {
    title: {
      ko: '새가족 환영회 — 매주 주일 예배 후',
      en: 'New Family Welcome Lunch — Every Sunday After Service',
    },
    date: '2026-05-25',
  },
  {
    title: {
      ko: '6월 특별 새벽기도회 일정 안내',
      en: 'June Special Early Morning Prayer Schedule',
    },
    date: '2026-05-20',
  },
  {
    title: {
      ko: '교회 주차장 보수 공사 안내 (6/8 ~ 6/12)',
      en: 'Parking Lot Repair Notice (June 8–12)',
    },
    date: '2026-05-18',
  },
  {
    title: {
      ko: '다음세대 여름 성경학교 자원봉사자 모집',
      en: 'Volunteers Needed for Next-Gen Summer Bible School',
    },
    date: '2026-05-12',
    link: '/news/volunteer-vbs-2026',
  },
  {
    title: {
      ko: '2026년 상반기 제직회 모임 결과 보고',
      en: 'Spring 2026 Officers’ Council Meeting Summary',
    },
    date: '2026-05-04',
  },
  {
    title: {
      ko: '온라인 헌금 시스템 업데이트 안내',
      en: 'Online Giving System Update',
    },
    date: '2026-04-27',
    link: '/giving',
  },
  {
    title: {
      ko: '여름 단기선교팀 파송 예배 (7/19 주일)',
      en: 'Summer Short-Term Missions Commissioning Service (Sun, July 19)',
    },
    date: '2026-04-20',
  },
]
