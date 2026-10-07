'use client'

import { useEffect, useState } from 'react'

export default function ViewCount() {
  const [visits, setVisits] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/views')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => typeof d?.visits === 'number' && setVisits(d.visits))
      .catch(() => {})
  }, [])

  if (visits === null) return null
  return (
    <p className="text-center mt-2 text-xs text-gray-500">
      <span aria-hidden="true">👀 </span>
      {visits.toLocaleString('en-IN')} {visits === 1 ? 'visit' : 'visits'} to this site
    </p>
  )
}
