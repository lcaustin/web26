// Temporary proxy to bypass CORS when fetching PDFs from static.lcaustin.org
// Used by the bulletin-generator skill to load PDFs into browser-based pdfjs for text extraction.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return new Response('Missing ?url=', { status: 400 })

  const upstream = await fetch(url)
  const body = await upstream.arrayBuffer()

  return new Response(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
