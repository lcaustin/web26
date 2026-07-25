import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bibleStudyId, name, email, phone, notes } = body

    if (!bibleStudyId || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // 1. Fetch the bible study
    const study = await payload.findByID({
      collection: 'bible-studies',
      id: bibleStudyId,
    }).catch(() => null)

    if (!study || study.status !== 'active') {
      return NextResponse.json(
        { error: 'Bible study is not active or does not exist' },
        { status: 404 }
      )
    }

    // 2. Check capacity limit if configured
    if (study.limit) {
      const countResult = await payload.count({
        collection: 'bible-study-signups',
        where: {
          and: [
            { bibleStudy: { equals: bibleStudyId } },
            { status: { not_in: ['cancelled'] } },
          ],
        },
      })

      if (countResult.totalDocs >= study.limit) {
        return NextResponse.json(
          { error: 'Registration is full for this bible study class' },
          { status: 400 }
        )
      }
    }

    // 3. Optional: Link to logged-in user if JWT is present in request cookies/headers
    // For now, we will create the signup as a pending registration.
    const userHeader = req.headers.get('x-user-id')
    const userId = userHeader ? parseInt(userHeader, 10) : undefined
    const user = (userId && !isNaN(userId)) ? userId : undefined

    // 4. Create the signup record
    const signup = await payload.create({
      collection: 'bible-study-signups',
      data: {
        bibleStudy: bibleStudyId,
        name,
        email,
        phone,
        notes: notes || undefined,
        status: 'pending',
        user,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for bible study',
      signup,
    })
  } catch (error: any) {
    console.error('Error registering for bible study:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
