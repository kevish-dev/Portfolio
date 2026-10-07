import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageShell from '@/components/PageShell'
import { projects, getProject } from '@/data/projects'
import { SITE_URL, SITE_NAME } from '@/data/site'
import { pageMetadata } from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug)
  if (!project) return {}
  return pageMetadata({
    title: `${project.title} case study`,
    description: `${project.title}: ${project.summary} A case study by ${SITE_NAME}.`,
    path: `/projects/${project.slug}`,
    type: 'article',
  })
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      {children}
    </section>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 text-gray-700 flex flex-col gap-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug)
  if (!project) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: `${SITE_URL}/projects/${project.slug}`,
    author: { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
    sameAs: [project.liveDemo, project.sourceCode].filter(Boolean),
  }

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <article>
        <h1 className="text-4xl font-black mb-2">{project.title}</h1>
        <p className="text-gray-600 mb-6">A case study by {SITE_NAME}</p>
        <Image
          src={project.image}
          alt={project.imageAlt}
          width={900}
          height={600}
          priority
          sizes="(min-width: 896px) 896px, 100vw"
          className="w-full h-auto rounded-xl shadow-lg"
        />
        <p className="mt-6 text-gray-700 leading-relaxed">{project.description}</p>

        {project.problem && (
          <Section title="Problem">
            <p className="text-gray-700">{project.problem}</p>
          </Section>
        )}
        <Section title="My role">
          <p className="text-gray-700">{project.role}</p>
        </Section>
        <Section title="What I built">
          <List items={project.built} />
        </Section>
        <Section title="Stack">
          <p className="text-gray-700">{project.technologies.join(', ')}</p>
        </Section>
        {project.facts && project.facts.length > 0 && (
          <Section title="Facts">
            <List items={project.facts} />
          </Section>
        )}
        {project.outcome && project.outcome.length > 0 && (
          <Section title="Outcome">
            <List items={project.outcome} />
          </Section>
        )}
        <Section title="Key decisions and trade-offs">
          <p className="text-gray-700">
            Coming soon: a write-up of the technical decisions behind {project.title}, and what I would do differently.
          </p>
        </Section>

        <Section title="Links">
          <ul className="list-disc pl-5 flex flex-col gap-1">
            {project.liveDemo && (
              <li>
                <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                  Open {project.title} (live site)
                </a>
              </li>
            )}
            {project.sourceCode && (
              <li>
                <a href={project.sourceCode} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                  {project.title} source code on GitHub
                </a>
              </li>
            )}
            <li>
              <Link href="/#work" className="text-blue-700 underline">
                All projects
              </Link>
            </li>
          </ul>
        </Section>
      </article>
    </PageShell>
  )
}
