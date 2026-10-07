import ResumeView from './ResumeView'
import { pageMetadata } from '@/lib/seo'
import { RESUME_BUCKET, dbSelect, isSupabaseConfigured, storagePublicUrl } from '@/lib/supabase'

export const metadata = pageMetadata({
  title: 'Resume',
  description: 'Resume of Kevish Sewliya, full-stack developer and CS & AI student at Newton School of Technology. View it online or download the PDF.',
  path: '/resume',
})

export const revalidate = 3600

const FALLBACK = '/Kevish_Resume.pdf'
const DOWNLOAD_NAME = 'Kevish_Sewliya_Resume.pdf'

async function latestResume() {
  if (!isSupabaseConfigured()) return null
  try {
    const [row] = await dbSelect<{ path: string }>('resume_versions', 'select=path&order=created_at.desc&limit=1', {
      next: { revalidate: 3600 },
    })
    return row ? storagePublicUrl(RESUME_BUCKET, row.path) : null
  } catch (e) {
    console.error(e)
    return null
  }
}

export default async function ResumePage() {
  const url = await latestResume()
  return (
    <ResumeView
      pdfUrl={url ?? FALLBACK}
      downloadUrl={url ? `${url}?download=${DOWNLOAD_NAME}` : FALLBACK}
      downloadName={DOWNLOAD_NAME}
    />
  )
}
