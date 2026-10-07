// Web Crypto helpers that work in both the Edge (middleware) and Node runtimes.

const encoder = new TextEncoder()

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function sha256(input: string) {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(input)))
}

export async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(data)))
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function clientIp(headers: Headers) {
  return headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown'
}

// Daily-rotating, salted hash: lets us count unique visitors per day without storing IPs.
export async function anonymousId(headers: Headers, scope: string) {
  const day = new Date().toISOString().slice(0, 10)
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  const ua = headers.get('user-agent') ?? ''
  return (await sha256(`${scope}:${secret}:${day}:${clientIp(headers)}:${ua}`)).slice(0, 32)
}
