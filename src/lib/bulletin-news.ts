import { createHash } from 'node:crypto'
import { PDFParse } from 'pdf-parse'

type Bulletin = { id: number | string; issueDate: string; url?: string | null }

type ExtractedAnnouncement = { title: string; body: string }

const normalize = (value: string) => value.replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim()
const keyFor = (bulletinID: Bulletin['id'], index: number, title: string) =>
  `${bulletinID}:${index}:${createHash('sha1').update(title).digest('hex').slice(0, 12)}`

const lexicalText = (text: string) => ({
  root: {
    type: 'root', format: '', indent: 0, version: 1, direction: null,
    children: text.split(/\n{2,}/).map((paragraph) => ({
      type: 'paragraph', format: '', indent: 0, version: 1, direction: null,
      children: [{ type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text: paragraph }],
    })),
  },
})

/** Extract the numbered announcements under the bulletin's Church News section. */
export function parseBulletinAnnouncements(text: string): ExtractedAnnouncement[] {
  const lines = text.split('\n').map(normalize).filter(Boolean)
  const heading = lines.findIndex((line) => /^(교회\s*소식|교회소식|광고|church\s+news|announcements?)$/i.test(line))
  if (heading < 0) return []

  const section = lines.slice(heading + 1)
  const chunks: string[][] = []
  let current: string[] | null = null
  for (const line of section) {
    if (/^(?:\d{1,2}[.)]|[①-⑳]|[•▪●▶])\s*/.test(line)) {
      if (current?.length) chunks.push(current)
      current = [line.replace(/^(?:\d{1,2}[.)]|[①-⑳]|[•▪●▶])\s*/, '')]
    } else if (current) {
      current.push(line)
    }
  }
  if (current?.length) chunks.push(current)

  return chunks
    .map((chunk) => {
      const body = chunk.join('\n').trim()
      const [first, ...rest] = body.split('\n')
      const [possibleTitle, remainder] = first.split(/\s*[:：]\s*/, 2)
      const title = normalize(remainder ? possibleTitle : first).slice(0, 140)
      return { title, body: normalize(remainder ? [remainder, ...rest].join('\n') : body) }
    })
    .filter((item) => item.title.length > 1 && item.body.length > 2)
    .slice(0, 30)
}

export async function syncBulletinNews(payload: any, bulletin: Bulletin) {
  if (!bulletin.url) return { created: 0, updated: 0, removed: 0, reason: 'No PDF URL' }
  const parser = new PDFParse({ url: bulletin.url })
  let text = ''
  try {
    text = (await parser.getText()).text
  } finally {
    await parser.destroy()
  }
  const announcements = parseBulletinAnnouncements(text)
  if (!announcements.length) return { created: 0, updated: 0, removed: 0, reason: 'No numbered announcements found under 교회소식 / Church News' }

  const existing: any = await payload.find({ collection: 'news', limit: 100, where: { sourceBulletin: { equals: bulletin.id } } })
  const byKey = new Map<string, any>(existing.docs.map((item: any) => [item.extractionKey, item]))
  const seen = new Set<string>()
  let created = 0
  let updated = 0

  for (const [index, announcement] of announcements.entries()) {
    const extractionKey = keyFor(bulletin.id, index, announcement.title)
    seen.add(extractionKey)
    const data = {
      title: { ko: announcement.title, en: '' },
      content: { ko: lexicalText(announcement.body), en: lexicalText('') },
      date: bulletin.issueDate,
      sourceBulletin: bulletin.id,
      extractionKey,
    }
    const matched = byKey.get(extractionKey)
    if (matched) {
      await payload.update({ collection: 'news', id: matched.id, data })
      updated++
    } else {
      await payload.create({ collection: 'news', data })
      created++
    }
  }

  const stale = existing.docs.filter((item: any) => !seen.has(item.extractionKey))
  await Promise.all(stale.map((item: any) => payload.delete({ collection: 'news', id: item.id })))
  return { created, updated, removed: stale.length }
}
