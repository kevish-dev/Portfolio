import { requireAdmin } from '@/lib/admin'
import { RESUME_BUCKET, dbSelect, isSupabaseConfigured, storagePublicUrl } from '@/lib/supabase'
import { deleteResume } from '../../actions'
import { safe } from '@/lib/safe'
import UploadForm from './UploadForm'

type Version = { id: string; created_at: string; path: string; size_bytes: number; original_name: string }

export default async function ResumeAdminPage() {
  await requireAdmin()
  const { data: versions, error } = await safe(
    () =>
      isSupabaseConfigured()
        ? dbSelect<Version>('resume_versions', 'select=id,created_at,path,size_bytes,original_name&order=created_at.desc&limit=50')
        : Promise.resolve([]),
    [] as Version[]
  )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Resume</h1>
      <p className="text-gray-700">
        The newest upload is shown on <a href="/resume" className="text-blue-700 underline">/resume</a>.
        With no uploads, the site falls back to the bundled PDF.
      </p>
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">{error}</p>}
      <UploadForm />
      <section className="rounded-xl bg-white p-5 shadow-sm border">
        <h2 className="font-semibold mb-3">Uploaded versions</h2>
        {versions.length === 0 ? (
          <p className="text-sm text-gray-600">No uploads yet.</p>
        ) : (
          <ul className="divide-y">
            {versions.map((v, i) => (
              <li key={v.id} className="py-3 flex flex-wrap items-center gap-3 text-sm">
                <a href={storagePublicUrl(RESUME_BUCKET, v.path)} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                  {v.original_name || v.path}
                </a>
                <span className="text-gray-600">
                  {new Date(v.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                  {' · '}{(v.size_bytes / 1024).toFixed(0)} KB
                </span>
                {i === 0 ? (
                  <span className="rounded-full bg-[#c5f467] px-2 font-semibold">Live</span>
                ) : (
                  <form action={deleteResume} className="ml-auto">
                    <input type="hidden" name="id" value={v.id} />
                    <button type="submit" className="px-3 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
