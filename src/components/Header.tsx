'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="w-full max-md:hidden fixed overflow-hidden top-2 flex justify-between z-[100] items-center gap-8 py-2.5 px-8 max-lg:px-4 backdrop-blur-sm border-2 border-white/60 bg-white/80 rounded-lg">
        <Link href="#home" className="text-sm font-medium text-black no-underline tracking-wider">
          &lt;KEVISH SEWLIYA /&gt;
        </Link>

        <nav className="flex gap-8 flex-wrap">
          <Link href="#experience" className="relative py-1 px-2 text-black no-underline text-lg transition-colors duration-300 hover:text-blue-500">Experience</Link>
          <Link href="#skills" className="relative py-1 px-2 text-black no-underline text-lg transition-colors duration-300 hover:text-blue-500">Skills</Link>
          <Link href="#work" className="relative py-1 px-2 text-black no-underline text-lg transition-colors duration-300 hover:text-blue-500">Projects</Link>
          <Link href="#education" className="relative py-1 px-2 text-black no-underline text-lg transition-colors duration-300 hover:text-blue-500">Education</Link>
          <Link href="/about" className="relative py-1 px-2 text-black no-underline text-lg transition-colors duration-300 hover:text-blue-500">About</Link>
        </nav>
    </header>
  )
}
