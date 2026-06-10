import type { Block } from 'payload'

export const PhotoGridBlock: Block = {
  slug: 'photoGrid',
  labels: { singular: '사진 갤러리', plural: '사진 갤러리' },
  fields: [
    {
      name: 'images',
      type: 'array',
      label: '이미지',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
