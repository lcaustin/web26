/**
 * One-time OCR-reviewed import of the July 5 and July 13, 2026 scanned
 * bulletins. Safe to re-run: each item upserts by its bulletin source key.
 *
 * Usage: pnpm tsx scripts/import-july-2026-bulletin-news.ts
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

type Article = { title: string; body: string }

const env = Object.fromEntries(['.env', '.env.local'].flatMap((name) => {
  const file = path.resolve(process.cwd(), name)
  if (!existsSync(file)) return []
  return readFileSync(file, 'utf8').split(/\r?\n/).map((line) => {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/)
    return match ? [match[1].trim(), match[2].replace(/^['"]|['"]$/g, '')] : []
  }).filter((entry) => entry.length === 2)
}))
const databaseURI = process.env.DATABASE_URI || env.DATABASE_URI
if (!databaseURI) throw new Error('DATABASE_URI is required')

const july5: Article[] = [
  { title: '환영', body: '조현절/강현, 곽현진/이찬숙, 이전석/송명연 가정의 등록을 환영합니다.' },
  { title: '감사', body: '어제 친교실 물품 이동과 새성전 준비에 수고하신 성도들께 감사를 드립니다.' },
  { title: '청소년부, EM 예배장소 및 성가대연습실 변경', body: '오늘(5일)부터 청소년부 예배와 EM 예배를 친교실에서 드립니다. 주차는 동일하게 교회 옆 오피스 건물에 할 수 있습니다. 아울러 성가대 연습은 포터블 301호에서 진행됩니다.' },
  { title: '상반기 결산 정기제직회', body: '다음 주일(7월 12일) 저녁 7시 30분에 줌으로 진행합니다. 제직들의 참여 바랍니다.' },
  { title: '예배운영부 인원 모집', body: '3부예배 안내와 봉사, 주차봉사로 섬길 예배운영부 인원을 모집합니다. 문의: 이기욱 집사 (512-884-8658)' },
  { title: '1부예배 셔틀봉사자 모집', body: '성전이전 후 1부예배 셔틀 차량운행으로 섬기실 봉사자를 찾습니다. 구간: 현 교회 근처 - 새교회 / 교회 버스 이용. 문의: 박소명 목사 (682-556-9769)' },
  { title: '찬양팀 모집', body: '모집분야: 음향 엔지니어 (메인 음향 오퍼레이션 및 오디오 엔지니어). 지원자격: 평소 음악을 많이 듣거나 악기를 다뤄본 경험이 있는 분. 문의 및 지원: 신종민 집사 (512-689-7220)' },
  { title: '청소년부 수련회', body: '청소년부 여름 수련회 등록이 시작되었습니다. 많은 관심과 기도를 부탁드립니다. 일시: 8월 6일(목)~9일(주일), 장소: JAMA Global Campus (Lindale, TX). 등록 마감 및 회비: 7월 5일까지 / $210. 문의 및 접수: 한종석 목사 (512-961-0990)' },
]

const july13: Article[] = [
  { title: '환영', body: '천승환/최수영, 유인학/유옥화, 강현기/임진희, 최영일/최영수 가정의 등록을 환영합니다.' },
  { title: '상반기 결산 공동의회', body: '상반기 결산 승인을 위한 당회가 오늘 저녁 8시에 있습니다. 공동의회는 다음 주일(19일) 저녁 8시에 줌으로 합니다.' },
  { title: '청소년부 JAMA YLC 컨퍼런스 참가', body: '청소년부에서 JAMA에서 진행하는 Youth Leadership Conference에 참가합니다. 모든 일정과 오고 가는 길을 위해 기도 바랍니다. 일정: 7월 13~17일 (월~금). 문의: 한종석 목사 (512-961-0990)' },
  { title: '청소년부 수련회 펀드레이징', body: '청소년부 여름수련회 버스 렌트비용 마련을 위한 펀드레이징을 진행합니다. 일시 및 참여: 7월 26일(주일), 아래 QR코드를 통해 사전주문 가능. 음식 메뉴: 돼지불고기 $17 (사전주문 $15), Coffee, Peach-Ade $4. 수련회 티셔츠: $25 (청소년부 학생은 무료)' },
  { title: '예배운영부 인원 모집', body: '3부예배 안내와 통역, 주차봉사로 섬길 예배운영부 섬김이를 모집합니다. 문의: 이기욱 집사 (512-884-8658)' },
  { title: '1부예배 셔틀봉사자 모집', body: '성전이전 후 1부예배 셔틀 차량운행으로 섬기실 봉사자를 찾습니다. 구간: 현 교회 근처 - 새교회 / 교회 버스 이용. 문의: 박소명 목사 (682-556-9769)' },
  { title: '도서반납 안내', body: '교회 이전을 앞두고 대출하신 도서는 8월 첫 주까지 교회 도서관으로 반납 바랍니다. 문의: 피재훈 집사 (707-623-7022)' },
  { title: '교인동정', body: '장재원 집사 모친상(한국)에 위로를 전합니다.' },
]

const lexical = (text: string) => {
  const sentences = text.split(/(?<=\.)\s+/)
  return {
    root: {
      type: 'root', format: '', indent: 0, version: 1, direction: null,
      children: [{
        type: 'paragraph', format: '', indent: 0, version: 1, direction: null,
        children: sentences.flatMap((sentence, index) => [
          { type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text: sentence },
          ...(index < sentences.length - 1 ? [{ type: 'linebreak', version: 1 }] : []),
        ]),
      }],
    },
  }
}

async function importBulletin(client: Client, bulletinID: number, date: string, articles: Article[]) {
  for (const [index, article] of articles.entries()) {
    const key = `${bulletinID}:${index + 1}`
    await client.query(
      `INSERT INTO news (admin_title, title_ko, title_en, content_ko, content_en, date, source_bulletin_id, extraction_key, slug, created_at, updated_at)
       VALUES ($1, $2, '', $3, $4, $5, $6, $7, $8, now(), now())
       ON CONFLICT (extraction_key) DO UPDATE SET
         admin_title = EXCLUDED.admin_title, title_ko = EXCLUDED.title_ko, content_ko = EXCLUDED.content_ko,
         content_en = EXCLUDED.content_en, date = EXCLUDED.date, updated_at = now()`,
      [article.title, article.title, lexical(article.body), lexical(''), date, bulletinID, key, `bulletin-${date}-${index + 1}`],
    )
  }
}

async function main() {
  const client = new Client({ connectionString: databaseURI })
  await client.connect()
  try {
    await importBulletin(client, 230, '2026-07-05', july5)
    await importBulletin(client, 231, '2026-07-13', july13)
    const { rows } = await client.query(`SELECT date::date AS date, count(*)::int AS count FROM news WHERE source_bulletin_id IN (230, 231) GROUP BY date::date ORDER BY date`) as any
    console.log(rows)
  } finally {
    await client.end()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
