import type { MetadataRoute } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://2026.lcaustin.org').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/reset-password'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
