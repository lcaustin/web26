import config from '@/payload.config'
import { getPayload } from 'payload'

function csv(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const user = await payload.auth({ headers: request.headers })
  if (!user.user) return new Response('Unauthorized', { status: 401 })

  const params = new URL(request.url).searchParams
  const ids = params.get('ids')?.split(',').filter(Boolean) ?? []
  const semesterId = params.get('semesterId')
  if (!ids.length && !semesterId) return new Response('No groups or semester selected', { status: 400 })

  const conditions = []
  if (ids.length) conditions.push({ id: { in: ids } })
  if (semesterId) conditions.push({ semesterRef: { equals: semesterId } })
  const result = await payload.find({
    collection: 'bible-studies',
    where: conditions.length === 1 ? conditions[0] : { and: conditions },
    sort: 'order,startDate',
    limit: 1000,
  })
  const header = ['ID', '과정', '학기', '그룹', '강사', '시간', '장소', '개강일', '정원', '상태']
  const rows = result.docs.map((study: any) => [
    study.id, study.title?.ko, study.subject, study.semesterRef?.name, study.targetGroup?.ko,
    study.instructor?.ko, study.timeDescription?.ko, study.location?.ko,
    study.startDate, study.limit, study.status,
  ])
  const body = '\uFEFF' + [header, ...rows].map((row) => row.map(csv).join(',')).join('\r\n')
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bible-study-groups.csv"',
    },
  })
}
