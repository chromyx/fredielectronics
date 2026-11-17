'use client'

import React, { useEffect, useState } from 'react'
import type { Img } from '@/lib/getHomeData'

const COLS = 6
const ROWS = 4
const HOLD = 5200

/**
 * The service photo shown as an LED wall: a grid of cabinets with fine seams. Every few seconds the
 * next project photo takes over cabinet by cabinet in a diagonal wave, the way content changes on a
 * real LED wall. With reduced motion it simply shows the first photo.
 */
export function HeroWall({ images, reduce }: { images: Img[]; reduce: boolean }) {
  const [idx, setIdx] = useState(0)
  const n = images.length

  useEffect(() => {
    if (reduce || n < 2) return
    let timer = 0
    const tick = () => { if (!document.hidden) setIdx((i) => (i + 1) % n) }
    timer = window.setInterval(tick, HOLD)
    return () => window.clearInterval(timer)
  }, [reduce, n])

  if (!n) return null
  const tiles = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      tiles.push(
        <div key={`${r}-${c}`} className="wall-tile" style={{ ['--c' as string]: c, ['--r' as string]: r, ['--d' as string]: c + r }}>
          {images.map((im, i) => (
            <img key={i} src={im.large} alt="" aria-hidden="true" className={i === idx ? 'on' : undefined}
              loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
          ))}
        </div>,
      )
    }
  }
  return (
    <figure className="wall" style={{ ['--cols' as string]: COLS, ['--rows' as string]: ROWS }}>
      <div className="wall-grid" role="img" aria-label={images[idx]?.alt || ''}>{tiles}</div>
      <span className="wall-seams" aria-hidden="true" />
      {n > 1 && (
        <figcaption className="wall-cap">
          <span className="wall-name">{images[idx]?.alt}</span>
          <span className="wall-dots" aria-hidden="true">{images.map((_, i) => <i key={i} className={i === idx ? 'on' : undefined} />)}</span>
        </figcaption>
      )}
    </figure>
  )
}
