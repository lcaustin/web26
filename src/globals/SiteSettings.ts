import type { GlobalConfig } from 'payload'

import { bilingualText } from '../fields/bilingual.ts'

// Site-wide settings: welcome banner + registration link shown at the top
// of the landing page (per mockup v16 "welcome_register_link")
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'group',
      name: 'hero',
      label: 'Hero Section',
      fields: [
        bilingualText('tagline', {
          label: 'Hero Tagline',
          required: false,
          koLabel: '태그라인 (Korean)',
          enLabel: 'Tagline (English)',
          multiline: true,
        }),
        bilingualText('sermonButtonLabel', {
          label: 'Sermon Button Label Override',
          required: false,
          koLabel: '버튼 텍스트 (Korean)',
          enLabel: 'Button Label (English)',
        }),
        {
          name: 'sermonButtonHref',
          type: 'text',
          label: 'Sermon Button Link URL Override',
          admin: { description: 'Leave blank for the automatic Daily Devotion / Sunday Sermon link.' },
        },
      ],
    },
    {
      type: 'group',
      name: 'welcomeBanner',
      label: 'Welcome Banner',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show banner',
        },
        bilingualText('message', {
          label: 'Banner Message',
          required: false,
          koLabel: '메시지 (Korean)',
          enLabel: 'Message (English)',
          multiline: true,
        }),
        bilingualText('registerLabel', {
          label: 'Registration Button Label',
          required: false,
          koLabel: '버튼 텍스트 (Korean)',
          enLabel: 'Button Label (English)',
        }),
        {
          name: 'registerHref',
          type: 'text',
          label: 'Registration Link URL',
        },
      ],
    },
    {
      type: 'group',
      name: 'church',
      label: 'Church Info',
      fields: [
        bilingualText('name', {
          label: 'Church Name',
          required: false,
          koLabel: '교회명 (Korean)',
          enLabel: 'Church Name (English)',
        }),
        bilingualText('address', {
          label: 'Address',
          required: false,
          koLabel: '주소 (Korean)',
          enLabel: 'Address (English)',
        }),
        {
          name: 'phone',
          type: 'text',
          label: 'Phone',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
        },
      ],
    },
  ],
}
