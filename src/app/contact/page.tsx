import PageShell from '@/components/PageShell'
import ContactForm from './ContactForm'
import { CONTACT_EMAIL } from '@/data/site'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'Contact Kevish Sewliya, full-stack developer and CS & AI student at Newton School of Technology. Send a message through the form or by email.',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <PageShell>
      <h1 className="text-4xl font-black mb-4">Contact Kevish Sewliya</h1>
      <p className="text-gray-700 mb-8">
        Send me a message below, or email me directly at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-700 underline">{CONTACT_EMAIL}</a>.
      </p>
      <ContactForm />
      <p className="text-sm text-gray-600 mt-10">
        Privacy: messages are stored only so I can reply to them. This site counts visits anonymously,
        without cookies and without storing IP addresses.
      </p>
    </PageShell>
  )
}
