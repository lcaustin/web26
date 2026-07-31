import config from '@/payload.config'
import { getPayload } from 'payload'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: request.headers })
  if (!auth.user || auth.user.isAdmin !== true) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { sourceSemesterId, newName } = await request.json()
  if (!sourceSemesterId || typeof newName !== 'string' || !newName.trim()) return Response.json({ error: 'Source semester and new name are required' }, { status: 400 })

  const existing = await payload.find({ collection: 'bible-study-semesters', where: { name: { equals: newName.trim() } }, limit: 1 })
  if (existing.docs.length) return Response.json({ error: 'That semester already exists' }, { status: 409 })
  const source = await payload.findByID({ collection: 'bible-study-semesters', id: sourceSemesterId }).catch(() => null)
  if (!source) return Response.json({ error: 'Source semester not found' }, { status: 404 })
  const createdSemester = await payload.create({ collection: 'bible-study-semesters', data: { name: newName.trim(), order: source.order, status: 'before' } })
  const groups = await payload.find({ collection: 'bible-studies', where: { semesterRef: { equals: sourceSemesterId } }, limit: 1000 })
  for (const group of groups.docs as any[]) {
    const { id, createdAt, updatedAt, adminTitle, semesterRef, semesterOption, semester, status, ...copy } = group
    await payload.create({ collection: 'bible-studies', data: { ...copy, semesterRef: createdSemester.id, status: 'before' } as any })
  }
  return Response.json({ semesterId: createdSemester.id, groupsCopied: groups.docs.length })
}
