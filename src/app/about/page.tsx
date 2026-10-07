import Link from 'next/link'
import PageShell from '@/components/PageShell'
import { projects } from '@/data/projects'
import { socialUrls, SITE_URL } from '@/data/site'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'About',
  description:
    'About Kevish Sewliya: full-stack developer, CS & AI student at Newton School of Technology and Secretary General of Dev Club. Built Love LeetCode.',
  path: '/about',
  type: 'profile',
})

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: { '@type': 'Person', name: 'Kevish Sewliya', url: SITE_URL },
}

export default function AboutPage() {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd).replace(/</g, '\\u003c') }}
      />
      <h1 className="text-4xl font-black mb-6">About Kevish Sewliya</h1>
      <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
        <p>
          I&apos;m a full-stack developer and a computer science and AI student at Newton School of Technology,
          Rishihood University (2024 to 2028). I build web products with React, TypeScript and Node.js.
        </p>
        <p>
          I built Love LeetCode, a DSA practice platform with learning paths and an in-browser code editor that
          has 200+ registered users. I am also the second-largest contributor by commits to DCODE, a student-led
          open-source platform.
        </p>
        <p>
          At Dev Club, the university&apos;s developer community, I joined as a member in September 2024, became a
          Maven in February 2025, leading development teams on club projects, and have been Secretary General
          since September 2025. I run technical sessions and workshops for junior members.
        </p>
        <p>
          In 2025 I was a frontend developer on the team that rebuilt the Neutron Fest website from scratch for the
          festival&apos;s second edition, Neutron 2.0. The site received 200K+ views, and the festival drew 2K+
          attendees through paid registrations.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Projects</h2>
      <ul className="list-disc pl-5 text-gray-700 flex flex-col gap-2">
        {projects.map((p) => (
          <li key={p.slug}>
            <Link href={`/projects/${p.slug}`} className="text-blue-700 underline">
              {p.title}
            </Link>
            : {p.summary}
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">Elsewhere</h2>
      <ul className="list-disc pl-5 text-gray-700 flex flex-col gap-2">
        {[
          ['GitHub', socialUrls.github],
          ['LinkedIn', socialUrls.linkedin],
          ['LeetCode', socialUrls.leetcode],
          ['X', socialUrls.x],
        ].map(([name, url]) => (
          <li key={name}>
            <a href={url} rel="me noopener noreferrer" className="text-blue-700 underline">
              Kevish Sewliya on {name}
            </a>
          </li>
        ))}
        <li>
          <Link href="/resume" className="text-blue-700 underline">
            Resume
          </Link>
        </li>
        <li>
          <Link href="/contact" className="text-blue-700 underline">
            Contact
          </Link>
        </li>
      </ul>
    </PageShell>
  )
}
