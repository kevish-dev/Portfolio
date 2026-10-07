import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

export const config = { matcher: ['/admin/:path*'] }

export async function middleware(req: NextRequest) {
  const isLogin = req.nextUrl.pathname === '/admin/login'
  const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)

  const res = !ok && !isLogin
    ? NextResponse.redirect(new URL('/admin/login', req.url))
    : ok && isLogin
      ? NextResponse.redirect(new URL('/admin', req.url))
      : NextResponse.next()

  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  res.headers.set('Cache-Control', 'no-store')
  return res
}
