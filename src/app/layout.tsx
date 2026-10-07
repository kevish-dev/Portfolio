import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import ViewTracker from '@/components/ViewTracker'
import {
  SITE_URL,
  SITE_NAME,
  JOB_TITLE,
  SITE_DESCRIPTION,
  sameAs,
} from '@/data/site'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${JOB_TITLE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${JOB_TITLE}`,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | ${JOB_TITLE}`,
    description: SITE_DESCRIPTION,
    site: '@kevishdotdev',
    creator: '@kevishdotdev',
  },
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  url: SITE_URL,
  jobTitle: JOB_TITLE,
  email: 'mailto:prokevish07@gmail.com',
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Newton School of Technology, Rishihood University',
  },
  sameAs,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {children}
        <ViewTracker />
      </body>
    </html>
  )
}
