import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@/payload.config'

// One-time helper route to populate each of the 8 다음세대 department records
// with content pulled from the corresponding live page on lcaustin.org —
// `description` (bilingual rich text), `slug`, and `href`. The `slug` for each
// department mirrors the path segment from its OLD lcaustin.org URL (e.g.
// https://lcaustin.org/nursery → slug "nursery"), and `href` now points to the
// internal detail page at /departments/{slug} rather than out to lcaustin.org.
// Visit /api/update-department-content once after `pnpm dev`/`pnpm devsafe` is
// running (and after /api/seed-departments has created the 8 records), then
// feel free to delete this route file. Matches records by their Korean name
// (`name.ko`). Disabled in production builds as a safety guard.

// ---- Minimal Lexical editor-state builders (paragraphs with bold "label: value" lines) ----

type TextNode = {
  type: 'text'
  detail: 0
  format: 0 | 1
  mode: 'normal'
  style: ''
  text: string
  version: 1
}

type LineBreakNode = { type: 'linebreak'; version: 1 }

type ParagraphNode = {
  type: 'paragraph'
  children: Array<TextNode | LineBreakNode>
  direction: 'ltr'
  format: ''
  indent: 0
  textFormat: 0
  textStyle: ''
  version: 1
}

const text = (value: string, bold = false): TextNode => ({
  type: 'text',
  detail: 0,
  format: bold ? 1 : 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

const linebreak = (): LineBreakNode => ({ type: 'linebreak', version: 1 })

const paragraph = (children: Array<TextNode | LineBreakNode>): ParagraphNode => ({
  type: 'paragraph',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
})

// A content "block" is either a plain paragraph of text (with optional \n line
// breaks), or a "label: value" line rendered with a bold label.
type Block = { text: string } | { label: string; value: string }

const blockToParagraph = (block: Block): ParagraphNode => {
  if ('label' in block) {
    return paragraph([text(`${block.label}: `, true), text(block.value)])
  }

  const lines = block.text.split('\n')
  const children: Array<TextNode | LineBreakNode> = []
  lines.forEach((line, i) => {
    if (i > 0) children.push(linebreak())
    children.push(text(line))
  })
  return paragraph(children)
}

const richTextFromBlocks = (blocks: Block[]) => ({
  root: {
    type: 'root',
    children: blocks.map(blockToParagraph),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

// ---- Department content sourced from the live lcaustin.org pages ----

const departmentContent: Record<
  string,
  { slug: string; href: string; ko: Block[]; en: Block[] }
> = {
  영아부: {
    slug: 'nursery',
    href: '/departments/nursery',
    ko: [
      { label: '대상', value: '만 0~2세' },
      { label: '언어', value: '한국어' },
      { label: '예배실', value: '영아부실 (102호)' },
      { label: '예배 시간', value: '주일예배: 오전 11시 15분' },
      {
        label: '목표',
        value:
          '하나님 말씀을 이유식과도 같이 정성껏 갈고 빻아 먹여 줌으로 영적인 지혜가 쑥쑥 자라 하나님과 사람에게 사랑스러운 한몸 공동체를 만들어 갑니다.',
      },
      {
        label: '실천사항',
        value:
          '뮤지컬 설교, 인형극 설교 등으로 하나님 말씀에 집중하여 신령과 진정으로 예배드리는 훈련을 할 수 있도록 도와줍니다.',
      },
      { label: '담당사역자', value: '라예솔 간사' },
      { label: '부장', value: '마지연 집사' },
    ],
    en: [
      { label: 'Ages', value: '0–2 years old' },
      { label: 'Language', value: 'Korean' },
      { label: 'Worship Room', value: 'Nursery Room (Room 102)' },
      { label: 'Worship Time', value: 'Sunday Worship: 11:15 AM' },
      {
        label: 'Goal',
        value:
          "We carefully prepare and feed God's Word like baby food, so that spiritual wisdom may grow and grow, forming a loving community with God and one another.",
      },
      {
        label: 'Approach',
        value:
          'Through musical sermons, puppet-show sermons and more, we help our little ones focus on the Word and learn to worship in spirit and in truth.',
      },
      { label: 'Pastoral Staff', value: 'Yesol Ra (Intern)' },
      { label: 'Department Head', value: 'Deacon Jiyeon Ma' },
    ],
  },
  유아부: {
    slug: 'preschool',
    href: '/departments/preschool',
    ko: [
      { label: '대상', value: '만 3~4세 어린이' },
      { label: '언어', value: '한국어' },
      { label: '예배실', value: '유아부 예배실 (본당 205호)' },
      {
        label: '예배 시간',
        value: '금요예배: 저녁 8시 (첫째주 제외)\n주일예배: 오전 11시 15분',
      },
      { label: '목표', value: '말씀 먹고 자라는 믿음 어린이!' },
      {
        label: '실천사항',
        value:
          '설교와 찬양을 통해 예배의 습관 기르기\nCraft 활동을 통해 말씀을 익히고 선생님 & 친구들과 교제의 시간 갖기\n매달 암송을 통해 말씀을 가까이하는 훈련하기',
      },
      { label: '담당사역자', value: '장은혜 전도사' },
      { label: '부장', value: '엄윤미 집사' },
    ],
    en: [
      { label: 'Ages', value: '3–4 years old' },
      { label: 'Language', value: 'Korean' },
      { label: 'Worship Room', value: 'Preschool Worship Room (Main Bldg., Room 205)' },
      {
        label: 'Worship Time',
        value: 'Friday Worship: 8:00 PM (except 1st week)\nSunday Worship: 11:15 AM',
      },
      { label: 'Goal', value: 'Children of faith who grow by feeding on the Word!' },
      {
        label: 'Approach',
        value:
          'Building habits of worship through sermons and praise; learning the Word and enjoying fellowship with teachers and friends through craft activities; drawing near to the Word through monthly Scripture memorization.',
      },
      { label: 'Pastoral Staff', value: 'Rev. Eunhye Jang' },
      { label: 'Department Head', value: 'Deacon Yunmi Eom' },
    ],
  },
  초등부: {
    slug: 'elementary',
    href: '/departments/elementary',
    ko: [
      { label: '대상', value: 'Kinder ~ 5학년 (Kinder to 5th Grades)' },
      {
        label: '언어',
        value: 'Kinder~2학년: 한국어/영어\n3~5학년: 영어',
      },
      { label: '예배실', value: 'Portable 초등부 예배실' },
      {
        label: '예배 시간',
        value: '주일예배: 오전 11:10 ~ 12:45\n금요성경공부: 오후 8:00 ~ 9:20 (매월 첫주 제외)',
      },
      { label: '목표', value: '왕되신 하나님을 섬기는 Vineyard' },
      {
        label: '실천사항',
        value:
          'Knowing God: 복음을 알고 (매일 QT와 매주 성경공부)\nWorshiping God: 예배의 감격으로 변화받아 (열정으로 드리는 예배)\nGlorifying God: 열방을 섬기자 (가정과 이웃을 위해 기도와 선교)',
      },
      {
        label: '특별행사',
        value:
          '3월 성경 암송 대회, 4월 부활절 Egg Hunting, 5월 달란트 마켓, 여름 VBS, 10월 Reformation Day, 11월 Courtyard 예배, 12월 Christmas Eve',
      },
      { label: '담당사역자', value: '고휘찬 전도사' },
      { label: '부장', value: '이윤경 집사' },
    ],
    en: [
      { label: 'Ages', value: 'Kinder to 5th Grade' },
      {
        label: 'Language',
        value: 'Korean/English (Kinder–2nd Grade)\nEnglish (3rd–5th Grade)',
      },
      { label: 'Worship Room', value: 'Portable Elementary Worship Room' },
      {
        label: 'Worship Time',
        value: 'Sunday Worship: 11:10 AM – 12:45 PM\nFriday Bible Study: 8:00 – 9:20 PM (except 1st week)',
      },
      { label: 'Goal', value: 'Vineyard — serving God our King' },
      {
        label: 'Approach',
        value:
          'Knowing God (daily QT and weekly Bible study), Worshiping God (passionate worship that transforms), Glorifying God (prayer and mission for family and neighbors).',
      },
      {
        label: 'Special Events',
        value:
          'March Bible Memory Contest, April Easter Egg Hunt, May Talent Market, Summer VBS, October Reformation Day, November Courtyard Worship, December Christmas Eve',
      },
      { label: 'Pastoral Staff', value: 'Rev. Hwichan Ko' },
      { label: 'Department Head', value: 'Deacon Yoonkyung Lee' },
    ],
  },
  중고등부: {
    slug: 'youth',
    href: '/departments/youth',
    ko: [
      { label: '대상', value: '중고등학교 학생 (6th – 12th Grades)' },
      { label: '언어', value: 'English / Korean' },
      { label: '예배실', value: 'LC Education Center' },
      {
        label: '예배 시간',
        value: '금요예배: 오후 8시 (매월 첫주 제외)\n주일예배: 오전 11:15',
      },
      {
        label: '목표',
        value:
          '1. 그리스도 안에서 신앙 정체성을 확립한다.\n2. 그리스도 안에서 공동체의 하나됨을 확립한다.\n3. 그리스도 안에서 예배, 말씀, 기도, 섬김의 거룩한 습관을 형성한다.',
      },
      {
        label: '실천사항',
        value:
          '예배: 강해설교와 주제설교, 학년별 small group을 통한 깊은 나눔과 기도\n교제: Friday Gathering의 Bible Study, Game Night, Movie Night, Sports Night, Praise & Prayer Night 등\n훈련: Praise Team Training, Summer Retreat, Mission Trip, VBS\n양육: QT, 성경읽기, 기도의 삶을 공동체와 함께 실천',
      },
      {
        label: '특별행사',
        value:
          'Bible Golden Bell, Senior Trip, Senior Banquet, Mission Trip, VBS, Graduation, Summer Retreat, Christmas Eve Event, Winter Retreat, Sports Night, Cook Off, Praise & Prayer Night, PTA Seminar',
      },
      { label: '담당사역자', value: '허신구 목사' },
      { label: '부장', value: '박필립 집사' },
      {
        label: '분반교사',
        value: '김진철, 김재민, Gregory, Weston, 곽미애, George, 김서현, David, Claire, 이한나',
      },
      { label: 'Event Admin.', value: 'Jennifer Hur' },
      { label: 'Worship Leader', value: 'David Oh' },
      { label: '스텝', value: 'Joseph Jung, June Kim, David Tak' },
      { label: 'Instagram', value: 'instagram.com/lc_youth' },
    ],
    en: [
      { label: 'Ages', value: 'Middle & High School Students (6th – 12th Grades)' },
      { label: 'Language', value: 'English / Korean' },
      { label: 'Worship Room', value: 'LC Education Center' },
      {
        label: 'Worship Time',
        value: 'Friday Worship: 8:00 PM (except 1st week)\nSunday Worship: 11:15 AM',
      },
      {
        label: 'Goal',
        value:
          "1. Establish a faith identity in Christ.\n2. Establish unity of community in Christ.\n3. Form holy habits of worship, the Word, prayer and service in Christ.",
      },
      {
        label: 'Approach',
        value:
          'Worship: expository and topical sermons followed by grade-level small groups for sharing and prayer\nFellowship: Friday Gathering events — Bible Study, Game Night, Movie Night, Sports Night, Praise & Prayer Night\nTraining: Praise Team Training, Summer Retreat, Mission Trip, VBS\nDiscipleship: a shared rhythm of QT, Bible reading and prayer',
      },
      {
        label: 'Special Events',
        value:
          'Bible Golden Bell, Senior Trip, Senior Banquet, Mission Trip, VBS, Graduation, Summer & Winter Retreat, Christmas Eve Event, Sports Night, Cook Off, Praise & Prayer Night, PTA Seminar',
      },
      { label: 'Pastoral Staff', value: 'Pastor Shingu Heo' },
      { label: 'Department Head', value: 'Deacon Phillip Park' },
      {
        label: 'Small Group Teachers',
        value: 'Jincheol Kim, Jaemin Kim, Gregory, Weston, Miae Kwak, George, Seohyun Kim, David, Claire, Hanna Lee',
      },
      { label: 'Event Admin.', value: 'Jennifer Hur' },
      { label: 'Worship Leader', value: 'David Oh' },
      { label: 'Staff', value: 'Joseph Jung, June Kim, David Tak' },
      { label: 'Instagram', value: 'instagram.com/lc_youth' },
    ],
  },
  대학청년부: {
    // Note: the "/colleage" URL the user provided returns no usable content
    // (likely a typo for "college" — the page appears broken or removed).
    // Using "youngadult" as the slug, matching the live, working page's path.
    slug: 'youngadult',
    href: '/departments/youngadult',
    ko: [
      { label: '대상', value: '대학 졸업자 혹은 만 26세 이상' },
      { label: '언어', value: '한국어' },
      { label: '모임시간', value: '대학청년부 예배: 매주 주일 오후 1시 30분, 본당' },
      { label: '담당사역자', value: '한종석 전도사' },
      { label: '부장', value: '황덕규 집사' },
      {
        label: '임원',
        value:
          '행정팀장: 이동호 / 예배팀장: 조성희 / 새가족팀장: 유새롬 / 친교팀장: 박요셉 / 간사: 장태영',
      },
      { label: '성경공부 팀장', value: '김예지, 김필재, 김찬울, 임은석' },
      { label: '유튜브채널', value: 'youtube.com/@LCtheseed' },
    ],
    en: [
      { label: 'Ages', value: 'College graduates, or age 26 and older' },
      { label: 'Language', value: 'Korean' },
      { label: 'Meeting Time', value: 'College & Young Adult Worship: Sundays at 1:30 PM, Main Sanctuary' },
      { label: 'Pastoral Staff', value: 'Rev. Jongseok Han' },
      { label: 'Department Head', value: 'Deacon Deokgyu Hwang' },
      {
        label: 'Officers',
        value:
          'Admin Team Lead: Dongho Lee / Worship Team Lead: Seonghee Cho / New Family Team Lead: Saerom Yoo / Fellowship Team Lead: Joseph Park / Staff: Taeyoung Jang',
      },
      { label: 'Bible Study Leads', value: 'Yeji Kim, Piljae Kim, Chanul Kim, Eunseok Im' },
      { label: 'YouTube Channel', value: 'youtube.com/@LCtheseed' },
    ],
  },
  EM: {
    slug: 'englishministry',
    href: '/departments/englishministry',
    ko: [
      { label: '대상', value: '18세 이상 (대학생 이상)' },
      { label: '언어', value: '영어' },
      { label: '예배실', value: 'LC Education Center' },
      { label: '예배 시간', value: '주일: 오후 1:30 (금요모임: 저녁 7:00)' },
      {
        label: '목적',
        value:
          '영어를 선호하는 주님의교회 성도들에게 그리스도 안에서 형제자매와 예배하고 교제할 수 있는 자리를 제공합니다.',
      },
      {
        label: 'Living Hope (이름의 의미)',
        value: '그리스도 안에 살아있는 소망을 둠으로 하나님과 친밀히 동행하며 성장하는 것',
      },
      {
        label: '비전',
        value: '복음 중심의 예배, 제자훈련, 선교적 공동체의 확산, 단기선교를 통한 국제 아웃리치',
      },
      { label: '담당목사', value: '김윤 목사 (Yun W. Kim, MD)' },
      { label: '스태프 리더', value: '김영수' },
      { label: 'Hope Group 리더', value: 'Eunice Kim, Alice Kim, David Oh, Ian Park' },
      { label: 'Instagram', value: 'instagram.com/lc_livinghope' },
      { label: '홈페이지', value: 'livinghopelc.com' },
    ],
    en: [
      { label: 'Age', value: '18+ (College & up)' },
      { label: 'Language', value: 'English' },
      { label: 'Worship Hall', value: 'LC Educational Center' },
      { label: 'Worship Service', value: 'Sunday at 1:30 PM (Fellowship: Friday gatherings at 7:00 PM)' },
      {
        label: 'Purpose',
        value:
          'To provide members of Lord’s Church who prefer an English-speaking environment a place to worship and have fellowship with brothers and sisters in Christ.',
      },
      {
        label: 'Our Name — "Living Hope"',
        value: 'To grow in intimacy with God by placing our living hope in Christ!',
      },
      {
        label: 'Vision',
        value:
          'Gospel-centered worship, Discipleship, Multiplying Missional Communities, International Outreach through Mission Trips.',
      },
      { label: 'EM Pastor', value: 'Yun W. Kim, MD' },
      { label: 'Staff Leader', value: 'Young Soo Kim' },
      { label: 'Hope Group Leaders', value: 'Eunice Kim, Alice Kim, David Oh, Ian Park' },
      { label: 'Instagram', value: 'instagram.com/lc_livinghope' },
      { label: 'Homepage', value: 'livinghopelc.com' },
    ],
  },
  에노스: {
    slug: 'enos',
    href: '/departments/enos',
    ko: [
      { label: '대상', value: '70세 이상의 어르신들' },
      { label: '언어', value: '한국어' },
      {
        label: '목표',
        value:
          '에노스의 목적은 어르신들이 예수님을 믿고 구원 받는 백성으로서 감사와 기쁨이 넘치는 삶을 누리시도록 돕는 것에 있습니다.',
      },
      { label: '회장', value: '송무준' },
      { label: '총무', value: '박일순' },
      { label: '모임', value: '봄, 가을 나들이' },
    ],
    en: [
      { label: 'Ages', value: '70 years and older' },
      { label: 'Language', value: 'Korean' },
      {
        label: 'Purpose',
        value:
          "Enos exists to help our seniors enjoy a life overflowing with gratitude and joy as people who believe in Jesus Christ and are saved by Him.",
      },
      { label: 'President', value: 'Mujun Song' },
      { label: 'Secretary', value: 'Ilsoon Park' },
      { label: 'Gatherings', value: 'Spring and fall outings' },
    ],
  },
  가온학교: {
    slug: 'gaonschool',
    href: '/departments/gaonschool',
    ko: [
      {
        text:
          '세상의 중심에서 빛이 되는 미래의 리더를 교육합니다.\n"가온"은 순수 한글로 "가운데"라는 뜻을 가지고 있으며, 가온학교는 세상의 가운데서 빛을 발하는 미래의 리더들을 교육하고자 세워졌습니다.',
      },
      { label: '대상', value: '4세 ~ 8학년' },
      { label: '내용', value: '기독교 세계관, 영어, 수학' },
      { label: '장소', value: '어스틴 주님의 교회 (301 W. Anderson Ln, Austin, TX 78752)' },
      { label: '시간', value: '매주 토요일 오전 9:00 ~ 오후 1:00' },
      { label: '수업료', value: '한 학기 $300 (다자녀, 사역자 자녀 할인 있음)' },
      { label: '문의', value: 'GAON@LCAUSTIN.ORG' },
      {
        label: '자원봉사자',
        value: '고등학교 자원봉사자는 봉사 시간에 따라 대통령 봉사상을 받을 수 있습니다.',
      },
    ],
    en: [
      {
        text:
          'Educating the future leaders who will shine at the center of the world.\n"Gaon" is a pure Korean word meaning "the center" — Gaon School was founded to raise up future leaders who shine at the center of the world.',
      },
      { label: 'Ages', value: '4 years old – 8th Grade' },
      { label: 'Subjects', value: 'Christian Worldview, English, Math' },
      { label: 'Location', value: "Lord's Church of Austin (301 W. Anderson Ln, Austin, TX 78752)" },
      { label: 'Time', value: 'Saturdays, 9:00 AM – 1:00 PM' },
      { label: 'Tuition', value: '$300 per semester (discounts for multiple children & ministry staff children)' },
      { label: 'Contact', value: 'GAON@LCAUSTIN.ORG' },
      {
        label: 'Volunteers',
        value: "High school volunteers can earn hours toward the President's Volunteer Service Award.",
      },
    ],
  },
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This update is disabled in production. Run it in development only.' },
      { status: 403 },
    )
  }

  const payload = await getPayload({ config })

  const updated: string[] = []
  const notFound: string[] = []

  for (const [nameKo, content] of Object.entries(departmentContent)) {
    const existing = await payload.find({
      collection: 'departments',
      where: { 'name.ko': { equals: nameKo } },
      limit: 1,
    })

    const doc = existing.docs[0]
    if (!doc) {
      notFound.push(nameKo)
      continue
    }

    await payload.update({
      collection: 'departments',
      id: doc.id,
      data: {
        slug: content.slug,
        href: content.href,
        description: {
          ko: richTextFromBlocks(content.ko),
          en: richTextFromBlocks(content.en),
        },
      },
    })
    updated.push(nameKo)
  }

  return NextResponse.json({
    message: `다음세대 (departments) content + slug/link update complete. Updated ${updated.length}, missing ${notFound.length}.`,
    updated,
    notFound,
    note:
      'Each department now has a `slug` matching its OLD lcaustin.org URL path segment (e.g. nursery, preschool, elementary, youth, youngadult, englishministry, enos, gaonschool), and `href` now points to the internal page at /departments/{slug} instead of the old external lcaustin.org URL. For 대학청년부, the slug "youngadult" was used — the "colleage" path the user originally listed returns no usable content (likely a typo for "college"; the page appears broken/removed) — "/youngadult" is the live, working page on the old site.',
  })
}
