'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GITHUB_REPOS_URL } from '@/data/site'
import { projects } from '@/data/projects'

export default function Work() {
  const [visibleProjects, setVisibleProjects] = useState<Set<number>>(new Set())
  const [titleVisible, setTitleVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTitleVisible(true)
          projects.forEach((_, index) => {
            setTimeout(() => {
              setVisibleProjects(prev => new Set([...prev, index]))
            }, 300 + index * 200)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <section ref={sectionRef} id="work" className="flex flex-col items-center justify-center gap-16 py-16 px-8  mx-auto">
      <h2 className={`text-3xl font-bold text-center transition-all duration-700 ${
        titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>Featured Work</h2>
      
      {projects.map((project, index) => (
        <div 
          key={index}
          className={`transition-all duration-700 ${
            visibleProjects.has(index) 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-12'
          }`}
        >
          <div className={`flex max-lg:flex-col gap-8 items-start w-full ${project.reverse ? 'flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2">
              <Image 
                src={project.image} 
                alt={project.imageAlt}
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <h3 className="text-2xl font-bold">{project.title}</h3>
              <p className="text-gray-600 leading-relaxed">{project.description}</p>
              
              <div>
                <span className="font-bold">Technologies -</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="bg-gray-200 py-1.5 px-3 text-sm rounded">{tech}</span>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="font-bold">Features -</span>
                <ul className="list-disc pl-5 text-gray-600 text-sm mt-2">
                  {project.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                {project.liveDemo && (
                <Link 
                  href={project.liveDemo} 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} live demo`}
                  className="inline-flex items-center gap-2 no-underline py-2.5 px-5 text-sm rounded-md transition-all duration-300 bg-blue-600 text-white hover:bg-blue-800"
                >
                  🔗 Live demo
                </Link>
                )}
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex items-center gap-2 no-underline py-2.5 px-5 text-sm rounded-md transition-all duration-300 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                >
                  Case study: {project.title}
                </Link>
                {project.sourceCode && (
                  <Link 
                    href={project.sourceCode} 
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} source code on GitHub`}
                    className="inline-flex items-center gap-2 no-underline py-2.5 px-5 text-sm rounded-md transition-all duration-300 bg-gray-900 text-white hover:bg-black"
                  >
                    🐙 Source Code
                  </Link>
                )}
              </div>
            </div>
          </div>
          {index < projects.length - 1 && <hr className="my-8 border-gray-300" />}
        </div>
      ))}
      
      <p className={`text-lg transition-all duration-700 delay-1000 ${
        titleVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        More of my work is on GitHub:{' '}
        <Link href={GITHUB_REPOS_URL} className="text-orange-500 hover:underline">
          View all repositories
        </Link>
      </p>
    </section>
  )
}
