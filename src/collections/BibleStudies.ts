import type { CollectionConfig } from 'payload'
import { bilingualText } from '../fields/bilingual.ts'
import { bilingualRichText } from '../fields/richText.ts'

type UserWithAdminFlag = { isAdmin?: boolean } | null | undefined
const isAdmin = (user: UserWithAdminFlag) => user?.isAdmin === true

export const BibleStudies: CollectionConfig = {
  slug: 'bible-studies',
  admin: {
    useAsTitle: 'adminTitle',
    defaultColumns: ['adminTitle', 'startDate', 'status', 'limit'],
    description: 'Seasonal Bible Studies and small groups available for registration',
    pagination: { defaultLimit: 30 },
    components: {
      beforeList: ['/components/admin/BibleStudyExportButton#default'],
    },
  },
  access: {
    read: () => true,
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: '-startDate',
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (data?.courseTypeRef) {
          const courseTypeDoc = typeof data.courseTypeRef === 'object'
            ? data.courseTypeRef
            : await req.payload.findByID({ collection: 'bible-study-course-types', id: data.courseTypeRef }).catch(() => null)
          if (courseTypeDoc?.slug) data.courseType = courseTypeDoc.slug
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req }) => {
        if (data) {
          let semester = ''
          if (data.semesterRef && typeof data.semesterRef === 'object') semester = data.semesterRef.name || ''
          else if (data.semesterRef) {
            const semesterDoc = await req.payload.findByID({ collection: 'bible-study-semesters', id: data.semesterRef }).catch(() => null)
            semester = semesterDoc?.name || ''
          }

          if (data.courseTypeRef) {
            const courseTypeDoc = typeof data.courseTypeRef === 'object'
              ? data.courseTypeRef
              : await req.payload.findByID({ collection: 'bible-study-course-types', id: data.courseTypeRef }).catch(() => null)
            if (courseTypeDoc?.slug) data.courseType = courseTypeDoc.slug
          }

          let courseName = ''
          if (data.courseType === 'coffee-break') courseName = '커피브레이크'
          else if (data.courseType === 'panorama') courseName = '신구약 맥잡기'
          else if (data.courseType === 'crown') courseName = '크라운 재정교실'
          else if (data.courseType === 'first-steps') courseName = '신앙의 첫걸음'

          const title = data.title?.ko || courseName || data.title?.en || 'Bible Study'
          const subject = data.subject || ''
          const instructor = data.instructor?.ko || data.instructor?.en || ''
          const targetGroup = data.targetGroup?.ko || data.targetGroup?.en || ''
          const time = data.timeDescription?.ko || data.timeDescription?.en || ''

          const parts = [semester, title, subject, targetGroup, instructor, time].filter(Boolean)
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
      type: 'text',
      label: 'Course Type Slug (legacy)',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'courseTypeRef',
      type: 'relationship',
      relationTo: 'bible-study-course-types',
      label: 'Course Type · 과정 종류',
      admin: { description: 'Select a course type managed from the Course Types admin page.' },
    },
    {
      name: 'semesterRef',
      type: 'relationship',
      relationTo: 'bible-study-semesters',
      label: 'Managed Semester · 학기',
      admin: { description: 'Select a semester created in the Semesters admin page.' },
    },
    bilingualText('title', {
      label: 'Custom Course Title (과정 제목)',
      required: false,
      enRequired: false,
      koLabel: '정해진 종류외 다른 과정',
      enLabel: 'Title (English)',
    }),
    {
      name: 'subject',
      type: 'text',
      label: 'Subject · 과목 (Optional)',
      admin: {
        description: 'Optional subject, e.g. 사도행전 or 로마서. Shown with the course name.',
        condition: (_, siblingData) => siblingData?.courseType === 'coffee-break',
      },
    },
    bilingualText('targetGroup', {
      label: 'Target Group/Class (대상/반)',
      required: false,
      enRequired: false,
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
      required: false,
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
      enRequired: false,
      koLabel: '시간 설명 (Korean) e.g., (월) 저녁 7:30',
      enLabel: 'Time Description (English) e.g., Monday 7:30 PM',
    }),
    bilingualText('location', {
      label: 'Location',
      required: false,
      enRequired: false,
      koLabel: '장소 (Korean) e.g., 교육관 또는 본당',
      enLabel: 'Location (English)',
    }),
    bilingualText('instructor', {
      label: 'Instructor/Leader (인도자/강사)',
      required: true,
      enRequired: false,
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
      defaultValue: 'before',
      options: [
        { label: '모집 준비중 · Before Open', value: 'before' },
        { label: '모집중 · Accepting Students', value: 'open' },
        { label: '마감 · Closed', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
