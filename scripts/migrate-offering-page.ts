/**
 * Creates or updates the legacy Online Offering page in Payload.
 * Usage: pnpm tsx scripts/migrate-offering-page.ts
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

for (const filename of ['.env', '.env.local']) {
  const file = path.resolve(process.cwd(), filename)
  if (!existsSync(file)) continue
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/)
    if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].replace(/^['"]|['"]$/g, '')
  }
}

const lexical = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: null,
      children: [{ type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text }],
    })),
  },
})

const content = [
  '본인이 사용하는 은행 App이나 홈페이지에서 QuickPay with Zelle를 사용하면 됩니다.',
  '받는 사람: offering@lcaustin.org',
  '헌금 시 교인 번호와 헌금 종류를 메모란에 기록해 주세요. 영문 이름은 기입하지 않으셔도 됩니다.',
  '교인 번호는 본인 전화번호 뒤의 4자리 숫자와 First Name 영어 철자 두 개, Last Name 영어 철자 하나를 합하여 기재합니다. 예: JO NG H AN, (512) 123-4567의 경우 4567JOH로 만듭니다.',
  '헌금 종류: 주일헌금 Sunday, 십일조 Tithe, 감사헌금 Thanks, 선교헌금 Mission, 1불선교 $1 week',
  '현장 예배 시 체크 작성 방법은 교회에 문의해 주세요. 문의: (512) 465-9191',
]
const assetBaseUrl = (process.env.R2_PUBLIC_URL || 'https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev').replace(/\/$/, '')

async function main() {
  const { default: config } = await import('../src/payload.config.ts')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })
  const existing = await payload.find({ collection: 'pages', where: { slug: { equals: 'offering' } }, limit: 1 })
  const data: any = {
    slug: 'offering',
    title: { ko: '온라인 헌금안내', en: 'Online Offering' },
    subtitle: { ko: '감사함으로 드리는 헌금 안내', en: 'Give with Gratitude' },
    icon: 'ti-heart-handshake',
    heroImageUrl: `${assetBaseUrl}/pages/offering/offering-banner.jpg`,
    sections: [{ blockType: 'richtext' as const, text: { ko: lexical(content) } }],
  }

  if (existing.docs[0]) {
    await payload.update({ collection: 'pages', id: existing.docs[0].id, data })
    console.log('Updated /offering in Payload.')
  } else {
    await payload.create({ collection: 'pages', data })
    console.log('Created /offering in Payload.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
