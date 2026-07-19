import type { CollectionConfig } from 'payload'

// The historic Mongo `videos` collection contains sermons alongside devotionals,
// worship recordings, choir videos, and ministry content. Keep it as one archive
// so each public view can filter the same canonical records.
export const Videos: CollectionConfig = {
  slug: 'videos',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'titleEn', 'category', 'publishedAt', 'source'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'adminTitle', type: 'text', required: true, label: 'Title' },
    { name: 'titleEn', type: 'text', label: 'English Title' },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'other',
      options: [
        { label: 'Sunday Sermon', value: 'sermon' },
        { label: 'Daily Devotion', value: 'daily-devotion' },
        { label: 'Worship Recording', value: 'worship' },
        { label: 'Choir', value: 'choir' },
        { label: 'Offering Song', value: 'offering-song' },
        { label: 'Ministry / Department', value: 'ministry' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
      ],
    },
    { name: 'videoId', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'videoUrl', type: 'text', required: true, label: 'Video URL' },
    { name: 'thumbnailUrl', type: 'text', label: 'Thumbnail URL' },
    { name: 'description', type: 'textarea' },
    { name: 'tags', type: 'text' },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
