'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { anonymousId, sha256, safeEqual } from '@/lib/crypto'
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, isAdminConfigured } from '@/lib/session'
import {
  RESUME_BUCKET, dbCount, dbDelete, dbInsert, dbSelect, dbUpdate, isSupabaseConfigured, storageDelete, storageUpload,
} from '@/lib/supabase'

export type FormResult = { error?: string; ok?: string }

const MAX_FAILED_LOGINS = 5 // per 15 minutes

export async function login(_prev: FormResult, form: FormData): Promise<FormResult> {
  if (!isAdminConfigured()) return { error: 'Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.' }

  const ipHash = await anonymousId(headers(), 'login')
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const failures = isSupabaseConfigured()
    ? await dbCount('admin_login_attempts', `ip_hash=eq.${ipHash}&created_at=gte.${since}`).catch((e) => {
        console.error(e)
        return 0
      })
    : 0
  if (failures >= MAX_FAILED_LOGINS) return { error: 'Too many failed attempts. Try again in 15 minutes.' }

  const password = String(form.get('password') ?? '')
  const ok = safeEqual(await sha256(password), await sha256(process.env.ADMIN_PASSWORD!))
  if (!ok) {
    if (isSupabaseConfigured()) await dbInsert('admin_login_attempts', { ip_hash: ipHash }).catch(console.error)
    await new Promise((r) => setTimeout(r, 1000))
    return { error: 'Wrong password.' }
  }

  cookies().set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  redirect('/admin')
}

export async function logout() {
  cookies().delete(SESSION_COOKIE)
  redirect('/admin/login')
}

const UUID = /^[0-9a-f-]{36}$/i

export async function setMessageRead(form: FormData) {
  await requireAdmin()
  const id = String(form.get('id'))
  if (!UUID.test(id)) return
  await dbUpdate('contact_messages', `id=eq.${id}`, { read: form.get('read') === 'true' })
  revalidatePath('/admin', 'layout')
}

export async function deleteMessage(form: FormData) {
  await requireAdmin()
  const id = String(form.get('id'))
  if (!UUID.test(id)) return
  await dbDelete('contact_messages', `id=eq.${id}`)
  revalidatePath('/admin', 'layout')
}

const MAX_RESUME_BYTES = 4 * 1024 * 1024

export async function uploadResume(_prev: FormResult, form: FormData): Promise<FormResult> {
  await requireAdmin()
  if (!isSupabaseConfigured()) return { error: 'Supabase is not configured.' }

  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a PDF file.' }
  if (file.size > MAX_RESUME_BYTES) return { error: 'The PDF must be 4 MB or smaller.' }

  const bytes = await file.arrayBuffer()
  const magic = new TextDecoder().decode(bytes.slice(0, 5))
  if (file.type !== 'application/pdf' || magic !== '%PDF-') return { error: 'That file is not a PDF.' }

  const path = `kevish-sewliya-resume-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`
  try {
    await storageUpload(RESUME_BUCKET, path, bytes, 'application/pdf')
    await dbInsert('resume_versions', { path, size_bytes: file.size, original_name: file.name.slice(0, 200) })
  } catch (e) {
    console.error(e)
    return { error: 'Upload failed. Check the Supabase bucket and keys.' }
  }
  revalidatePath('/resume')
  revalidatePath('/admin/resume')
  return { ok: 'Uploaded. /resume now shows this file.' }
}

export async function deleteResume(form: FormData) {
  await requireAdmin()
  const id = String(form.get('id'))
  if (!UUID.test(id)) return
  const [row] = await dbSelect<{ path: string }>('resume_versions', `select=path&id=eq.${id}`)
  if (!row) return
  await storageDelete(RESUME_BUCKET, row.path).catch(console.error)
  await dbDelete('resume_versions', `id=eq.${id}`)
  revalidatePath('/resume')
  revalidatePath('/admin/resume')
}
