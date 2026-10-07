import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, verifySessionToken } from './session'

export async function isAdmin() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value)
}

// Call at the top of every admin page and server action (middleware is not enough on its own).
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login')
}
