type ExtractedAnnouncement = { title: string; titleEn: string; body: string }

const normalize = (value: string) => value.replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim()
const omittedTitles = new Set(['교인동정', '환영', '감사'])
const shouldImport = (title: string) => !omittedTitles.has(normalize(title).split('/')[0].trim())
export const splitBilingualTitle = (title: string) => {
  const [koreanTitle, englishTitle] = title.split(/\s*\/\s*/, 2).map(normalize)
  return { title: koreanTitle, titleEn: englishTitle || '' }
}
/** Extract the numbered announcements under the bulletin's Church News section. */
export function parseBulletinAnnouncements(text: string): ExtractedAnnouncement[] {
  const lines = text.split('\n').map(normalize).filter(Boolean)
  const heading = lines.findIndex((line) => /(교회\s*소식|교회소식|광고|church\s+news|ouncements?)/i.test(line))
  // Some scanned bulletins OCR the heading unreliably. The announcements
  // themselves retain their numbered format, so use the page as a fallback.
  const section = heading < 0 ? lines : lines.slice(heading + 1)
  const chunks: string[][] = []
  let current: string[] | null = null
  for (const line of section) {
    if (/^(?:\d{1,2}[.,)]|[①-⑳]|[•▪●▶])\s*/.test(line)) {
      if (current?.length) chunks.push(current)
      current = [line.replace(/^(?:\d{1,2}[.,)]|[①-⑳]|[•▪●▶])\s*/, '')]
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
      return { ...splitBilingualTitle(title), body: normalize(remainder ? [remainder, ...rest].join('\n') : body) }
    })
    .filter((item) => item.title.length > 1 && item.body.length > 2 && shouldImport(item.title))
    .slice(0, 30)
}
