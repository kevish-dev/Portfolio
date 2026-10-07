import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Footer from './Footer'

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-700 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">Back to Kevish Sewliya&apos;s portfolio</span>
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">{children}</main>
      <Footer />
    </div>
  )
}
