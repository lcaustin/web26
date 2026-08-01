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
        description: 'Paste the YouTube embed URL, e.g. https://www.youtube.com/embed/id8zSShJPl0',
        placeholder: 'https://www.youtube.com/embed/...',
      },
    },

    {
      name: 'layout',
      type: 'select',
      label: '페이지 레이아웃 (Page Layout)',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Training & Ministry', value: 'training' },
        { label: 'New Family Registration', value: 'registration' },
      ],
      admin: {
        description: '훈련&사역 페이지는 Training & Ministry를 선택하세요.',
      },
    },
    {
      name: 'registration',
      type: 'group',
      label: '새가족 등록 설정 (New Family Registration)',
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'registration',
      },
      fields: [
        bilingualText('description', {
          label: '등록 안내 문구',
          required: false,
          koLabel: '안내 문구 (Korean)',
          enLabel: 'Description (English)',
          multiline: true,
        }),
        bilingualText('notice', {
          label: '강조 안내 문구',
          required: false,
          koLabel: '강조 안내 (Korean)',
          enLabel: 'Notice (English)',
          multiline: true,
        }),
        {
          name: 'steps',
          type: 'array',
          label: '등록 절차',
          labels: { singular: 'Step', plural: 'Steps' },
          fields: [
            { name: 'imageUrl', type: 'text', label: 'Illustration URL' },
            bilingualText('title', {
              label: '절차 제목',
              required: true,
              koLabel: '제목 (Korean)',
              enLabel: 'Title (English)',
            }),
          ],
        },
        {
          name: 'formUrl',
          type: 'text',
          label: 'Online Registration Form URL',
        },
        {
          name: 'formLabel',
          type: 'text',
          label: 'Registration Form Button Label',
          defaultValue: '온라인 등록카드 작성',
        },
      ],
    },
    {
      name: 'mission',
      type: 'group',
      label: '선교지 설정 (Mission Settings)',
      admin: {
        condition: (_, siblingData) => siblingData?.slug === 'mission',
      },
      fields: [
        {
          name: 'overseas',
          type: 'textarea',
          label: '해외선교 목록',
          admin: {
            description: '한 줄에 한 항목씩 입력하세요. 국가 | 선교사 | 후원 공동체 순서로 | 기호로 구분합니다.',
          },
        },
        {
          name: 'partners',
          type: 'textarea',
          label: '단체 및 교회 목록',
          admin: {
            description: '한 줄에 한 항목씩 입력하세요. 단체 | 담당자 순서로 | 기호로 구분합니다.',
          },
        },
      ],
    },
    {
      name: 'training',
      type: 'group',
      label: '훈련&사역 설정 (Training Page Settings)',
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'training',
      },
      fields: [
        {
          name: 'heroStyle',
          type: 'select',
          label: '이미지 표시 방식',
          defaultValue: 'none',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Overlay hero', value: 'overlay' },
            { label: 'Wide banner', value: 'banner' },
            { label: 'Feature image in panel', value: 'feature' },
          ],
        },
        {
          name: 'heroTitle',
          type: 'text',
          label: '히어로 제목',
        },
        {
          name: 'heroSubtitle',
          type: 'text',
          label: '히어로 부제목',
        },
        {
          name: 'panelTitle',
          type: 'text',
          label: '본문 상단 제목',
        },
        {
          name: 'panelSubtitle',
          type: 'text',
          label: '본문 상단 부제목',
        },
        {
          name: 'showDivider',
          type: 'checkbox',
          label: '제목 아래 세로 구분선 표시',
          defaultValue: false,
        },
        {
          name: 'body',
          type: 'textarea',
          label: '본문',
          admin: {
            description: '문단은 빈 줄로 구분합니다.',
          },
        },
        {
          name: 'registerUrl',
          type: 'text',
          label: '신청 링크',
        },
        {
          name: 'registerLabel',
          type: 'text',
          label: '신청 버튼 문구',
          defaultValue: '신청하기',
        },
        {
          name: 'closedMessage',
          type: 'text',
          label: '신청 마감 문구',
        },
        {
          name: 'videoSearchKeyword',
          type: 'text',
          label: '영상 검색 키워드',
        },
        {
          name: 'videoTitle',
          type: 'text',
          label: '영상 섹션 제목',
          defaultValue: '영상',
        },
        {
          name: 'videoSubtitle',
          type: 'text',
          label: '영상 섹션 부제목',
        },
        {
          name: 'videoArchiveLabel',
          type: 'text',
          label: '영상 목록 라벨',
        },
      ],
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
