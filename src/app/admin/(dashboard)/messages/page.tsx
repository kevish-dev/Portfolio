import { requireAdmin } from '@/lib/admin'
import { dbSelect, isSupabaseConfigured } from '@/lib/supabase'
import { safe } from '@/lib/safe'
import { deleteMessage, setMessageRead } from '../../actions'

type Message = { id: string; created_at: string; name: string; email: string; message: string; read: boolean }

export default async function MessagesPage() {
  await requireAdmin()
  const { data: messages, error } = await safe(
    () =>
      isSupabaseConfigured()
        ? dbSelect<Message>('contact_messages', 'select=id,created_at,name,email,message,read&order=created_at.desc&limit=200')
        : Promise.resolve([]),
    [] as Message[]
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Messages</h1>
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">{error}</p>}
      {!error && messages.length === 0 && <p className="text-gray-600">No messages yet.</p>}
      {messages.map((m) => (
        <article key={m.id} className={`rounded-xl border p-5 shadow-sm ${m.read ? 'bg-white' : 'bg-[#c5f467]/10 border-[#9cc63f]'}`}>
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">
              {m.name} · <a href={`mailto:${m.email}`} className="text-blue-700 underline">{m.email}</a>
            </h2>
            <time dateTime={m.created_at} className="text-sm text-gray-600">
              {new Date(m.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
            </time>
          </header>
          <p className="mt-3 whitespace-pre-wrap text-gray-800">{m.message}</p>
          <div className="mt-4 flex gap-2 text-sm">
            <a
              href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message on kevish.dev')}`}
              className="px-3 py-1.5 rounded-md bg-black text-white"
            >
              Reply by email
            </a>
            <form action={setMessageRead}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="read" value={String(!m.read)} />
              <button type="submit" className="px-3 py-1.5 rounded-md border bg-white hover:bg-gray-100">
                Mark as {m.read ? 'unread' : 'read'}
              </button>
            </form>
            <form action={deleteMessage}>
              <input type="hidden" name="id" value={m.id} />
              <button type="submit" className="px-3 py-1.5 rounded-md border border-red-300 text-red-700 bg-white hover:bg-red-50">
                Delete
              </button>
            </form>
          </div>
        </article>
      ))}
    </div>
  )
}
