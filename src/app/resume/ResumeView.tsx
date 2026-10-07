import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'

export default function ResumeView({ pdfUrl, downloadUrl, downloadName }: { pdfUrl: string; downloadUrl: string; downloadName: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Back to portfolio</span>
            </Link>
            
            <a
              href={downloadUrl}
              download={downloadName}
              className="flex items-center gap-2 bg-[#c5f467] text-black py-2 px-6 rounded-full font-semibold transition-all duration-300 hover:bg-[#b5e457]"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download PDF
            </a>
          </div>
        </div>
      </header>

      {/* PDF Viewer */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Resume: Kevish Sewliya</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-[calc(100vh-180px)] min-h-[800px]"
            title="Resume of Kevish Sewliya (PDF)"
          />
        </div>
      </main>
    </div>
  )
}
