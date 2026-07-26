import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import config from '@/payload.config'

type TurnstileResult = {
  success?: boolean
  action?: string
  hostname?: string
  'error-codes'?: string[]
}

const TURNSTILE_ACTION = 'bible-study-signup'

function getExpectedTurnstileHostnames() {
  return new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? '')
      .split(',')
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  )
}

async function verifyTurnstile(req: Request, token: unknown) {
  const secret = process.env.TURNSTILE_SECRET
  const expectedHostnames = getExpectedTurnstileHostnames()

  if (
    !secret ||
    typeof token !== 'string' ||
    token.length === 0 ||
    token.length > 2048 ||
    expectedHostnames.size === 0
  ) {
    return false
  }

  const forwardedFor = req.headers.get('x-forwarded-for')
  const remoteip = forwardedFor?.split(',')[0]?.trim()
  const body = new URLSearchParams({
    secret,
    response: token,
  })

  if (remoteip) {
    body.set('remoteip', remoteip)
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      return false
    }

    const result = (await res.json()) as TurnstileResult

    return (
      result.success === true &&
      result.action === TURNSTILE_ACTION &&
      typeof result.hostname === 'string' &&
      expectedHostnames.has(result.hostname)
    )
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bibleStudyId, name, email, phone, notes, turnstileToken } = body

    if (!bibleStudyId || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!(await verifyTurnstile(req, turnstileToken))) {
      return NextResponse.json(
        { error: 'Spam protection failed' },
        { status: 403 }
      )
    }

    const payload = await getPayload({ config })

    // 1. Fetch the bible study
    const study = await payload.findByID({
      collection: 'bible-studies',
      id: bibleStudyId,
    }).catch(() => null)

    if (!study || study.status !== 'open') {
      return NextResponse.json(
        { error: 'Bible study is not active or does not exist' },
        { status: 404 }
      )
    }

    if (study.status !== 'open') {
      return NextResponse.json(
        { error: 'Signup is not open for this bible study class' },
        { status: 403 }
      )
    }

    // 2. Check capacity limit if configured
    if (study.limit) {
      const countResult = await payload.count({
        collection: 'bible-study-signups',
        where: {
          and: [
            { bibleStudy: { equals: bibleStudyId } },
          ],
        },
      })

      if (countResult.totalDocs >= study.limit) {
        await payload.update({
          collection: 'bible-studies',
          id: bibleStudyId,
          data: { status: 'closed' },
        })
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
