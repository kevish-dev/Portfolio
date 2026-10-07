'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const educationData = [
  {
    logo: '/RU Campus.png',
    institution: 'Newton School of Technology, Rishihood University',
    degree: 'Bachelor in Computer Science and Artificial Intelligence',
    duration: '2024 - 2028',
    description: 'Currently studying Computer Science and AI, with a focus on machine learning.'
  },
  {
    logo: '/Anss.png',
    institution: 'Adharsh Navodaya Public School',
    degree: 'School education',
    duration: '2010 - 2024',
    description: 'Completed school education before joining Newton School of Technology.'
  }
]

export default function Education() {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const [titleVisible, setTitleVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTitleVisible(true)
          educationData.forEach((_, index) => {
            setTimeout(() => {
              setVisibleCards(prev => new Set([...prev, index]))
            }, 200 + index * 200)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <section id="education" className="bg-gray-100 py-16 px-6">
      <div ref={sectionRef} className="flex flex-col gap-8 max-w-[1000px] mx-auto">
        <h2 className={`text-3xl font-bold text-center transition-all duration-700 ${
          titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>Education</h2>
        
        {educationData.map((edu, index) => (
          <div 
            key={index} 
            className={`flex max-md:flex-col gap-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-500 ${
              visibleCards.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="w-[200px] h-[150px] flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
              <Image 
                src={edu.logo} 
                alt={`${edu.institution} logo`}
                width={200}
                height={150}
                className="object-contain"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">{edu.institution}</h3>
              <p className="text-lg">{edu.degree}</p>
              <p className="text-sm text-gray-500">{edu.duration}</p>
              <p className="text-gray-500">{edu.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
