import 'server-only'

// Minimal Supabase REST client (PostgREST + Storage) built on fetch.
// Uses the secret key, so it must only ever run on the server.

// Accept whatever was pasted (quotes, trailing slash, "/rest/v1", missing https://)
// and reduce it to the bare project origin, e.g. https://abcd1234.supabase.co
function normalizeUrl(raw: string | undefined) {
  const trimmed = raw?.trim().replace(/^["']|["']$/g, '')
  if (!trimmed) return undefined
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`).origin
  } catch {
    return undefined
  }
}

const url = normalizeUrl(process.env.SUPABASE_URL)
const key = process.env.SUPABASE_SECRET_KEY?.trim().replace(/^["']|["']$/g, '')

export const RESUME_BUCKET = 'resume'

export function isSupabaseConfigured() {
  return Boolean(url && key)
}

function headers(extra?: HeadersInit): Headers {
  const h = new Headers(extra)
  h.set('apikey', key!)
  // Legacy service_role keys are JWTs and go in Authorization too.
  // New sb_secret_ keys are accepted in the apikey header alone.
  if (!key!.startsWith('sb_')) h.set('Authorization', `Bearer ${key}`)
  return h
}

type FetchOpts = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }

async function request(path: string, init: FetchOpts = {}) {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured')
  const res = await fetch(`${url}${path}`, {
    cache: init.next ? undefined : 'no-store',
    ...init,
    headers: headers(init.headers),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Supabase ${init.method ?? 'GET'} ${path.split('?')[0]} failed: ${res.status} ${body.slice(0, 200)}`)
  }
  return res
}

export async function dbSelect<T>(table: string, query: string, init?: FetchOpts): Promise<T[]> {
  const res = await request(`/rest/v1/${table}?${query}`, init)
  return res.json()
}

export async function dbInsert(table: string, row: Record<string, unknown>) {
  await request(`/rest/v1/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  })
}

export async function dbUpdate(table: string, filter: string, patch: Record<string, unknown>) {
  await request(`/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  })
}

export async function dbDelete(table: string, filter: string) {
  await request(`/rest/v1/${table}?${filter}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
}

export async function dbCount(table: string, filter: string): Promise<number> {
  const res = await request(`/rest/v1/${table}?select=id&${filter}`, {
    method: 'HEAD',
    headers: { Prefer: 'count=exact' },
  })
  const range = res.headers.get('content-range') ?? '*/0'
  return Number(range.split('/')[1]) || 0
}

export async function rpc<T>(fn: string, args: Record<string, unknown> = {}, init?: FetchOpts): Promise<T> {
  const res = await request(`/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    ...init,
  })
  return res.json()
}

export async function storageUpload(bucket: string, path: string, body: ArrayBuffer, contentType: string) {
  await request(`/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType, 'x-upsert': 'false', 'cache-control': 'max-age=3600' },
    body,
  })
}

export async function storageDelete(bucket: string, path: string) {
  await request(`/storage/v1/object/${bucket}/${path}`, { method: 'DELETE' })
}

export function storagePublicUrl(bucket: string, path: string) {
  return `${url}/storage/v1/object/public/${bucket}/${path}`
}
