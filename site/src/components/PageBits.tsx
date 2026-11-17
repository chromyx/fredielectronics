'use client'

import React, { useEffect, useState } from 'react'
import type { Locale, ProjectCard } from '@/lib/getHomeData'
import { UI } from '@/lib/ui'

/**
 * Inner pages: decides full vs reduced motion (same rule as the homepage: the OS setting,
 * overridden by ?motion) and plays the one entrance — the page title and photo.
 */
export function usePageMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const r = matchMedia('(prefers-reduced-motion: reduce)').matches && !new URLSearchParams(location.search).has('motion')
    setReduce(r)
    document.documentElement.classList.toggle('motion', !r)
    document.documentElement.classList.add('ready')
  }, [])
  return reduce
}

export function ProjectCards({ projects, locale, onOpen }: { projects: ProjectCard[]; locale: Locale; onOpen: (p: ProjectCard, from: HTMLElement) => void }) {
  const t = UI[locale]
  return (
    <div className="grid">
      {projects.map((p) => (
        <article key={p.id} className="card" tabIndex={0}
          onClick={(e) => onOpen(p, e.currentTarget)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(p, e.currentTarget) }}>
          <div className="ph">{p.cover && <img src={p.cover.card} alt={p.cover.alt} loading="lazy" />}</div>
          <div className="body">
            <div className="meta">{p.location && <span className="tag">{p.location}</span>}<span>{t.photos(p.images.length)}</span>{p.year && <span>{p.year}</span>}</div>
            <h3>{p.title}</h3>
          </div>
        </article>
      ))}
    </div>
  )
}
