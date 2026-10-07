import { dbInsert, isSupabaseConfigured } from '@/lib/supabase'
import { anonymousId } from '@/lib/crypto'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

export const dynamic = 'force-dynamic'

const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless|pagespeed|monitor|curl|wget|python|axios|node-fetch/i

function device(ua: string) {
  if (/ipad|tablet/i.test(ua)) return 'Tablet'
  if (/mobi|android|iphone/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

function browser(ua: string) {
  if (/edg\//i.test(ua)) return 'Edge'
  if (/opr\/|opera/i.test(ua)) return 'Opera'
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/chrome|crios/i.test(ua)) return 'Chrome'
  if (/safari/i.test(ua)) return 'Safari'
  return 'Other'
}

function header(req: Request, name: string) {
  const v = req.headers.get(name)
  if (!v) return null
  try {
    return decodeURIComponent(v).slice(0, 100)
  } catch {
    return v.slice(0, 100)
  }
}

export async function POST(req: Request) {
  const done = new Response(null, { status: 204 })
  if (!isSupabaseConfigured()) return done

  const ua = req.headers.get('user-agent') ?? ''
  if (!ua || BOT.test(ua)) return done

  // Do not count the site owner's own visits.
  const cookie = req.headers.get('cookie')?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1]
  if (await verifySessionToken(cookie)) return done

  let body: { path?: unknown; referrer?: unknown }
  try {
    body = JSON.parse(await req.text())
  } catch {
    return new Response(null, { status: 400 })
  }

  const path = typeof body.path === 'string' ? body.path.split('?')[0].slice(0, 200) : ''
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return done

  let referrerHost: string | null = null
  if (typeof body.referrer === 'string' && body.referrer) {
    try {
      const host = new URL(body.referrer).hostname.replace(/^www\./, '')
      const own = (req.headers.get('host') ?? '').split(':')[0].replace(/^www\./, '')
      if (host && host !== own) referrerHost = host.slice(0, 100)
    } catch {}
  }

  try {
    await dbInsert('page_views', {
      path,
      referrer_host: referrerHost,
      country: header(req, 'x-vercel-ip-country'),
      region: header(req, 'x-vercel-ip-country-region'),
      city: header(req, 'x-vercel-ip-city'),
      device: device(ua),
      browser: browser(ua),
      visitor_hash: await anonymousId(req.headers, 'view'),
    })
  } catch (e) {
    console.error(e)
  }
  return done
}
