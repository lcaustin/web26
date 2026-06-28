// Plain Next.js Route Handlers (the custom /api/mobile/* routes) are NOT covered
// by Payload's `cors`/`csrf` config in payload.config.ts — that only applies to
// Payload's own generated REST handlers (the [...slug] catch-all that serves
// /api/users, /api/users/login, etc.). Routes we hand-write ourselves need to set
// CORS headers manually, or the Capacitor app's WebView (origin https://localhost)
// gets blocked at the browser's CORS preflight step with no useful server-side error.

const ALLOWED_ORIGINS = ['https://localhost', 'capacitor://localhost', 'http://localhost']

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') || ''
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

export function withCors(request: Request, response: Response): Response {
  const headers = corsHeaders(request)
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }
  return response
}

export function handleOptions(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}
