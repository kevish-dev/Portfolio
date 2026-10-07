'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

let firstView = true

// Sends one anonymous page view per route change. No cookies, no IDs stored in the browser.
export default function ViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    // The external referrer only applies to the first page of a visit.
    const referrer = firstView ? document.referrer : ''
    firstView = false
    const body = JSON.stringify({ path: pathname, referrer })
    if (navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) return
    fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {})
  }, [pathname])

  return null
}
