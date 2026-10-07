import { NextResponse } from 'next/server'
import { GITHUB_USERNAME } from '@/data/site'

// Server-side proxy for the GitHub widget, so the token never reaches the browser
// and responses are cached instead of hitting GitHub's rate limit on every visit.

const ALLOWED = new Set([
  `users/${GITHUB_USERNAME}`,
  `users/${GITHUB_USERNAME}/repos`,
  `users/${GITHUB_USERNAME}/followers`,
  `users/${GITHUB_USERNAME}/following`,
  `users/${GITHUB_USERNAME}/starred`,
])
const ALLOWED_PARAMS = ['per_page', 'sort']

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/')
  if (!ALLOWED.has(path)) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  const incoming = new URL(req.url).searchParams
  const query = new URLSearchParams()
  for (const p of ALLOWED_PARAMS) {
    const v = incoming.get(p)
    if (v && /^[a-z0-9]{1,10}$/i.test(v)) query.set(p, v)
  }

  const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'kevish.dev' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const res = await fetch(`https://api.github.com/${path}${query.size ? `?${query}` : ''}`, {
    headers,
    next: { revalidate: 3600 },
  })
  const body = await res.text()
  return new NextResponse(body, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': res.ok ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store',
    },
  })
}
