import type { MetadataRoute } from 'next'
import config from '@payload-config'
import { getPayload } from 'payload'

const siteUrl = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://2026.lcaustin.org').replace(/\/$/, '')
const url = (path: string) => `${siteUrl}${path}`

export const dynamic = 'force-dynamic'

/** Public routes and Payload-managed content for search-engine discovery. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    ['', 1],
    ['/introduction', 0.8],
    ['/service-hours', 0.8],
    ['/staff', 0.8],
    ['/history', 0.7],
    ['/bulletin', 0.7],
    ['/sermons', 0.9],
    ['/videos', 0.9],
    ['/videos/daily-devotion', 0.7],
    ['/videos/worship', 0.7],
    ['/videos/choir', 0.7],
    ['/photos', 0.8],
    ['/news', 0.9],
  ].map(([path, priority]) => ({ url: url(path as string), priority: priority as number }))

  try {
    const payload = await getPayload({ config })
    const [news, albums, departments, pages] = await Promise.all([
      payload.find({ collection: 'news', limit: 1000, depth: 0, sort: '-updatedAt' }),
      payload.find({ collection: 'photo-albums', limit: 1000, depth: 0, sort: '-updatedAt' }),
      payload.find({ collection: 'departments', limit: 1000, depth: 0, sort: '-updatedAt' }),
      payload.find({ collection: 'pages', limit: 1000, depth: 0, sort: '-updatedAt' }),
    ])

    return [
      ...staticPages,
      ...news.docs.filter((item: any) => item.slug).map((item: any) => ({ url: url(`/news/${item.slug}`), lastModified: item.updatedAt, priority: 0.7 })),
      ...albums.docs.filter((item: any) => item.slug).map((item: any) => ({ url: url(`/photos/${item.slug}`), lastModified: item.updatedAt, priority: 0.6 })),
      ...departments.docs.filter((item: any) => item.slug).map((item: any) => ({ url: url(`/departments/${item.slug}`), lastModified: item.updatedAt, priority: 0.7 })),
      ...pages.docs.filter((item: any) => item.slug).map((item: any) => ({ url: url(`/${item.slug}`), lastModified: item.updatedAt, priority: 0.7 })),
    ]
  } catch {
    // Keep /sitemap.xml valid if Payload is temporarily unavailable.
    return staticPages
  }
}
