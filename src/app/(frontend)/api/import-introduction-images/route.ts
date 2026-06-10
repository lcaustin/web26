import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

const IMAGES = [
  {
    key: 'hero',
    url: 'https://static.lcaustin.org/uploads/image/697696034057671c8ba0d91d.jpeg',
    filename: 'intro-hero.jpg',
    alt: '어스틴 주님의교회 전경',
  },
  {
    key: 'photo1',
    url: 'https://lcaustin.org/_next/static/images/intro-1-cd13a5d0332057dcd83201cde0e45033.jpg',
    filename: 'intro-1.jpg',
    alt: '교회 사진 1',
  },
  {
    key: 'photo2',
    url: 'https://lcaustin.org/_next/static/images/intro-2-692ed926dc83a76232beddcd698a2550.jpg',
    filename: 'intro-2.jpg',
    alt: '교회 사진 2',
  },
  {
    key: 'photo3',
    url: 'https://lcaustin.org/_next/static/images/intro-3-6c2cbf7c866bf10cf14c88ef2452aed2.jpg',
    filename: 'intro-3.jpg',
    alt: '교회 사진 3',
  },
]

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const results: Record<string, any> = {}

    for (const img of IMAGES) {
      // Download image
      const res = await fetch(img.url)
      if (!res.ok) {
        results[img.key] = { error: `HTTP ${res.status} for ${img.url}` }
        continue
      }

      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const contentType = res.headers.get('content-type') ?? 'image/jpeg'

      // Upload to Payload Media
      const media = await payload.create({
        collection: 'media',
        data: { alt: img.alt },
        file: {
          data: buffer,
          mimetype: contentType,
          name: img.filename,
          size: buffer.length,
        },
      })

      results[img.key] = { id: media.id, url: media.url, filename: img.filename }
    }

    // Update introduction page with hero image ID and store photo IDs in heroImageUrl temporarily
    const heroMedia = results['hero']
    if (heroMedia?.id) {
      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: 'introduction' } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'pages',
          id: existing.docs[0].id,
          data: {
            heroImage: heroMedia.id,
            heroImageUrl: null,
          },
        })
        results['page_updated'] = true
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
