import config from '@payload-config'
import { getPayload } from 'payload'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function GET() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'news', limit: 200, sort: '-date' })

  const results = []
  const usedSlugs = new Set<string>()

  for (const item of docs) {
    if ((item as any).slug) {
      usedSlugs.add((item as any).slug)
      results.push({ id: item.id, slug: (item as any).slug, skipped: true })
      continue
    }

    const base = (item as any).title?.en || (item as any).title?.ko || `news-${item.id}`
    const year = item.date ? new Date(item.date).getFullYear() : ''
    let slug = toSlug(`${base}${year ? '-' + year : ''}`)

    // De-duplicate
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${item.id}`
    }
    usedSlugs.add(slug)

    await payload.update({ collection: 'news', id: item.id, data: { slug } as any })
    results.push({ id: item.id, slug, updated: true })
  }

  return Response.json({ ok: true, results })
}
