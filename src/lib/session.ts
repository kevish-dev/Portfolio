import { hmac, safeEqual } from './crypto'

export const SESSION_COOKIE = 'admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET
  return s && s.length >= 32 ? s : null
}

export function isAdminConfigured() {
  return Boolean(secret() && process.env.ADMIN_PASSWORD)
}

export async function createSessionToken() {
  const s = secret()
  if (!s) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters')
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  return `${exp}.${await hmac(s, `admin:${exp}`)}`
}

export async function verifySessionToken(token: string | undefined) {
  const s = secret()
  if (!s || !token) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false
  return safeEqual(sig, await hmac(s, `admin:${exp}`))
}
