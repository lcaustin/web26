import type { CollectionConfig } from 'payload'
import { bilingualText } from '../fields/bilingual.ts'
import { bilingualRichText } from '../fields/richText.ts'

export const BibleStudies: CollectionConfig = {
  slug: 'bible-studies',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'startDate', 'status', 'limit'],
    description: 'Seasonal Bible Studies and small groups available for registration',
  },
  access: {
    read: () => true,
  },
  defaultSort: '-startDate',
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data) {
          const semester = data.semester?.ko || data.semester?.en || ''
          
          let courseName = ''
          if (data.courseType === 'coffee-break') courseName = '커피브레이크'
          else if (data.courseType === 'panorama') courseName = '신구약 맥잡기'
          else if (data.courseType === 'crown') courseName = '크라운 재정교실'
          else if (data.courseType === 'first-steps') courseName = '신앙의 첫걸음'
          
          const title = data.title?.ko || courseName || data.title?.en || 'Bible Study'
          const instructor = data.instructor?.ko || data.instructor?.en || ''
          const targetGroup = data.targetGroup?.ko || data.targetGroup?.en || ''
          const time = data.timeDescription?.ko || data.timeDescription?.en || ''

          const parts = [semester, title, instructor, targetGroup, time].filter(Boolean)
          data.adminTitle = parts.join(' - ')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'adminTitle',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'courseType',
      type: 'select',
      label: 'Course Type (과정 종류)',
      required: true,
      options: [
        { label: '커피브레이크 (Coffee Break)', value: 'coffee-break' },
        { label: '신구약 맥잡기 (Bible Panorama)', value: 'panorama' },
        { label: '크라운 재정교실 (Crown Financial Study)', value: 'crown' },
        { label: '신앙의 첫걸음 (First Steps of Faith)', value: 'first-steps' },
      ],
    },
    bilingualText('semester', {
      label: 'Semester (학기)',
      required: true,
      koLabel: '학기 (Korean) e.g., 2026 상반기',
      enLabel: 'Semester (English) e.g., 2026 Spring',
    }),
    bilingualText('title', {
      label: 'Custom Course Title (과정 제목)',
      required: true,
      koLabel: '제목 (Korean) e.g., 커피브레이크 또는 신구약 맥잡기',
      enLabel: 'Title (English)',
    }),
    bilingualText('targetGroup', {
      label: 'Target Group/Class (대상/반)',
      required: true,
      koLabel: '대상/반 이름 (Korean) e.g., 월요일 남성반 또는 영어반',
      enLabel: 'Target Group/Class (English) e.g., Monday Men\'s Class',
    }),
    bilingualRichText('description', {
      label: 'Description',
      required: false,
      koLabel: '설명 (Korean)',
      enLabel: 'Description (English)',
    }),
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Start date of the class',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Optional end date of the class',
      },
    },
    bilingualText('timeDescription', {
      label: 'Time Description',
      required: true,
      koLabel: '시간 설명 (Korean) e.g., (월) 저녁 7:30',
      enLabel: 'Time Description (English) e.g., Monday 7:30 PM',
    }),
    bilingualText('location', {
      label: 'Location',
      required: true,
      koLabel: '장소 (Korean) e.g., 교육관 또는 본당',
      enLabel: 'Location (English)',
    }),
    bilingualText('instructor', {
      label: 'Instructor/Leader (인도자/강사)',
      required: true,
      koLabel: '인도자 성함 (Korean) e.g., 이우재',
      enLabel: 'Instructor/Leader Name (English) e.g., Timothy Kim',
    }),
    {
      name: 'limit',
      type: 'number',
      label: 'Capacity Limit',
      admin: {
        description: 'Optional maximum number of participants. Leave blank for unlimited.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active (Open for signup)', value: 'active' },
        { label: 'Completed / Closed', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
