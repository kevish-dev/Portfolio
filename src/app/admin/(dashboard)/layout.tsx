import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { dbCount, isSupabaseConfigured } from '@/lib/supabase'
import { logout } from '../actions'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  const unread = isSupabaseConfigured() ? await dbCount('contact_messages', 'read=is.false').catch(() => 0) : 0
  const link = 'px-3 py-2 rounded-md hover:bg-gray-100'

  return (
    <>
      <header className="bg-white border-b">
        <nav aria-label="Admin" className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          <span className="font-bold mr-4">Admin</span>
          <Link href="/admin" className={link}>Analytics</Link>
          <Link href="/admin/messages" className={link}>
            Messages{unread > 0 && <span className="ml-1 rounded-full bg-[#c5f467] px-2 text-sm font-semibold">{unread}</span>}
          </Link>
          <Link href="/admin/resume" className={link}>Resume</Link>
          <Link href="/" className={`${link} ml-auto`}>View site</Link>
          <form action={logout}>
            <button type="submit" className={link}>Log out</button>
          </form>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!isSupabaseConfigured() && (
          <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
            Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY, then run supabase/schema.sql.
          </p>
        )}
        {children}
      </main>
    </>
  )
}
