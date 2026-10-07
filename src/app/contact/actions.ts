'use server'

import { dbCount, dbInsert, isSupabaseConfigured } from '@/lib/supabase'
import { anonymousId } from '@/lib/crypto'
import { headers } from 'next/headers'

export type ContactState = { status: 'idle' | 'success' | 'error'; message: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_PER_HOUR = 5

export async function sendMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  const name = String(form.get('name') ?? '').trim()
  const email = String(form.get('email') ?? '').trim()
  const message = String(form.get('message') ?? '').trim()
  const honeypot = String(form.get('company') ?? '')
  const startedAt = Number(form.get('startedAt') ?? 0)

  // Bots fill hidden fields and submit instantly; pretend it worked.
  if (honeypot || Date.now() - startedAt < 2000) {
    return { status: 'success', message: 'Thanks! Your message has been sent.' }
  }

  if (!name || name.length > 100) return { status: 'error', message: 'Please enter your name (up to 100 characters).' }
  if (!EMAIL.test(email) || email.length > 254) return { status: 'error', message: 'Please enter a valid email address.' }
  if (message.length < 10 || message.length > 5000) {
    return { status: 'error', message: 'Please write a message between 10 and 5,000 characters.' }
  }
  if (!isSupabaseConfigured()) {
    return { status: 'error', message: 'The contact form is not available right now. Please email me instead.' }
  }

  try {
    const ipHash = await anonymousId(headers(), 'contact')
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    if ((await dbCount('contact_messages', `ip_hash=eq.${ipHash}&created_at=gte.${since}`)) >= MAX_PER_HOUR) {
      return { status: 'error', message: 'Too many messages in the last hour. Please try again later or email me.' }
    }
    await dbInsert('contact_messages', { name, email, message, ip_hash: ipHash })
    return { status: 'success', message: "Thanks! Your message has been sent. I'll reply by email." }
  } catch (e) {
    console.error(e)
    return { status: 'error', message: 'Something went wrong. Please try again or email me.' }
  }
}
