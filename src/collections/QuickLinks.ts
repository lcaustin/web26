import type { CollectionConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'

// 바로가기 (Quick Links) — resource tile grid on the landing page
export const QuickLinks: CollectionConfig = {
  slug: 'quick-links',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'icon', 'href', 'order'],
    description: '바로가기 tiles (매일말씀묵상, 온라인 헌금안내, 예배시간 안내, 토요 골방기도, …)',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  fields: [
    bilingualText('name', {
      label: 'Link Name',
      koLabel: '이름 (Korean)',
      enLabel: 'Name (English)',
    }),
    {
      name: 'icon',
      type: 'text',
      required: true,
      admin: { description: 'Tabler Icons class name, e.g. "ti-bible", "ti-heart", "ti-clock", "ti-candle"' },
    },
    {
      name: 'href',
      type: 'text',
      required: true,
      admin: { description: 'Internal path (e.g. "/service-times") or external URL' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower numbers appear first' },
    },
  ],
}
