'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import GitHubContributions from './GitHubContributions'

export default function Hero() {
  const [titleVisible, setTitleVisible] = useState(0)
  const [descVisible, setDescVisible] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)
  
  const titleLine1 = "FULL STACK ENGINEER"
  const titleLine2 = "KEVISH SEWLIYA"
  const techStack = "<React.js Next.js Redux.js Node.js TypeScript>"
  
  const totalChars = titleLine1.length + titleLine2.length + techStack.length
  
  useEffect(() => {
    // Animate title characters one by one
    const interval = setInterval(() => {
      setTitleVisible(prev => {
        if (prev >= totalChars) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 30)
    
    // Show description after title animation
    const descTimer = setTimeout(() => {
      setDescVisible(true)
    }, totalChars * 30 + 200)
    
    // Show button after description
    const buttonTimer = setTimeout(() => {
      setButtonVisible(true)
    }, totalChars * 30 + 600)
    
    return () => {
      clearInterval(interval)
      clearTimeout(descTimer)
      clearTimeout(buttonTimer)
    }
  }, [])
  
  const renderAnimatedText = (text: string, startIndex: number) => {
    return text.split('').map((char, i) => (
      <span
        key={i}
        className={`inline-block transition-all duration-150 ${
          titleVisible > startIndex + i
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: `${i * 10}ms` }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  return (
    <section id="home" className="min-h-screen w-full flex flex-col items-center justify-center py-20">
      <div className="flex flex-col w-full px-16 gap-8 max-lg:px-8 max-md:px-4">
        {/* Top Section - Title */}
        <div className="w-full mx-auto ">
          
          <h1 className="text-[5rem] font-black leading-[1.05] tracking-[-3px] mb-4 uppercase max-lg:text-[3.5rem] max-md:text-[2.5rem] max-md:tracking-[-1px]">
            <span className="block">{renderAnimatedText(titleLine1, 0)}</span>
            <span className="block">{renderAnimatedText(titleLine2, titleLine1.length)}</span>
          </h1>
          
          <p className="text-sm font-medium tracking-wider">
            {renderAnimatedText(techStack, titleLine1.length + titleLine2.length)}
          </p>
        </div>
        
        {/* Bottom Section - Description & GitHub */}
        <div className="flex items-start justify-between gap-16 w-full max-lg:flex-col max-lg:gap-8">
          <div className="flex-shrink-0 max-w-[400px] max-lg:max-w-full">
            <div className={`text-[0.95rem] text-gray-600 max-w-[380px] leading-relaxed mb-8 transition-all duration-700 ${
              descVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <p className="mb-4">
                I&apos;m a full-stack developer and a computer science and AI student at Newton School of Technology, Rishihood University. As Secretary General of Dev Club, I lead the club&apos;s technical projects and mentor student developers.
              </p>
              <p>
                I built <strong>Love LeetCode</strong>, a DSA practice platform with 200+ registered users, and I&apos;m the second-largest contributor to <strong>DCODE</strong>, a student-led open-source platform.
              </p>
            </div>
            
            <div className={`flex gap-4 flex-wrap transition-all duration-500 ${
              buttonVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <Link 
                href="/contact"
                className="inline-block bg-[#c5f467] text-black py-4 px-8 rounded-full font-semibold no-underline transition-all duration-300 hover:bg-[#b5e457] hover:-translate-y-0.5"
              >
                Contact Me
              </Link>
              
              <Link 
                href="/resume"
                className="inline-block bg-black text-white py-4 px-8 rounded-full font-semibold no-underline transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5"
              >
                View Resume
              </Link>
            </div>
          </div>
          
          <div className="flex-1 flex justify-end items-start max-lg:justify-start max-lg:w-full">
            <GitHubContributions />
          </div>
        </div>
      </div>
    </section>
  )
}
