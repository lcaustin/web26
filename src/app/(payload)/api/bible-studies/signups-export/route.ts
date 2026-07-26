import config from '@/payload.config'
import { getPayload } from 'payload'

const cell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: request.headers })
  if (!auth.user) return new Response('Unauthorized', { status: 401 })

  const ids = new URL(request.url).searchParams.get('ids')?.split(',').filter(Boolean) ?? []
  if (!ids.length) return new Response('No signups selected', { status: 400 })

  const result = await payload.find({
    collection: 'bible-study-signups',
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
  })
  const header = ['이름 · Name', '전화번호 · Phone', '이메일 · Email', '과정 · Course', '그룹 · Group', '강사 · Leader', '시간 · Time', '메모 · Notes']
  const rows = result.docs.map((signup: any) => {
    const study = typeof signup.bibleStudy === 'object' ? signup.bibleStudy : {}
    return [signup.name, signup.phone, signup.email, study.title?.ko, study.targetGroup?.ko, study.instructor?.ko, study.timeDescription?.ko, signup.notes]
  })
  const body = '\uFEFF' + [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bible-study-signups.csv"',
    },
  })
}
