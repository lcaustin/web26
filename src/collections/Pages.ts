import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'
import { bilingualRichText } from '../fields/richText.ts'
import { PhotoGridBlock } from '../blocks/PhotoGrid.ts'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'slug',
    description: '사이트의 정적 페이지를 관리합니다 (교회소개, 예배안내 등)',
    defaultColumns: ['slug', 'title', 'updatedAt'],
    group: 'Site',
  },
  fields: [
    // URL slug — e.g. "introduction", "service-hours"
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL path: /introduction, /service-hours, etc. (lowercase, hyphens only)',
        placeholder: 'introduction',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title?.en) return toSlug(data.title.en)
            if (value) return toSlug(value)
            return value
          },
        ],
      },
    },

    // Bilingual page title
    bilingualText('title', { label: '페이지 제목 (Page Title)', required: true }),

    // Tabler icon name shown in the page header circle
    {
      name: 'icon',
      type: 'text',
      defaultValue: 'ti-file',
      admin: {
        description: 'Tabler icon class, e.g. ti-church, ti-calendar, ti-users',
        placeholder: 'ti-church',
      },
    },

    // Short subtitle under the page title
    bilingualText('subtitle', {
      label: '부제목 (Subtitle)',
      required: false,
      koLabel: '한국어 부제목',
      enLabel: 'English Subtitle',
    }),

    // Optional highlighted callout box (e.g. welcome message on intro page)
    {
      name: 'callout',
      type: 'group',
      label: '강조 문구 (Callout Box)',
      admin: {
        description: 'Optional — shows a highlighted box above the main content.',
      },
      fields: [
        bilingualText('tagline', {
          label: '태그라인 (Tagline)',
          required: false,
          koLabel: '한국어 태그라인',
          enLabel: 'English Tagline',
        }),
        bilingualText('message', {
          label: '메시지 (Message)',
          required: false,
          koLabel: '한국어 메시지',
          enLabel: 'English Message',
        }),
      ],
    },

    // Hero banner image — upload to Media or paste an external URL
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: '히어로 이미지 (Hero Image)',
      required: false,
      admin: {
        description: 'Large banner photo shown at the top of the page with the tagline overlaid.',
      },
    },
    {
      name: 'heroImageUrl',
      type: 'text',
      label: '히어로 이미지 외부 URL (fallback)',
      required: false,
      admin: {
        description: 'Used only if no Media upload is selected above. Paste a direct image URL.',
        placeholder: 'https://static.lcaustin.org/uploads/image/...',
      },
    },

    // Optional YouTube embed URL
    {
      name: 'youtubeUrl',
      type: 'text',
      label: 'YouTube 임베드 URL',
      admin: {
        description: 'Paste the YouTube embed URL, e.g. https://www.youtube.com/embed/6lzTX1ze7aQ',
        placeholder: 'https://www.youtube.com/embed/...',
      },
    },

    // Content sections — drag to reorder; mix richtext and photo grids freely
    {
      name: 'sections',
      type: 'blocks',
      label: '콘텐츠 섹션 (Content Sections)',
      blocks: [
        {
          slug: 'richtext',
          labels: { singular: '텍스트', plural: '텍스트 블록' },
          fields: [
            bilingualRichText('text', { label: '본문', required: false }),
          ],
        },
        PhotoGridBlock,
      ],
    },
  ],
}
