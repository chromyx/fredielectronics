'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from './motion'
import type { Locale, ProjectCard } from '@/lib/getHomeData'
import { UI } from '@/lib/ui'
import { getLenis } from './scroll'

type Props = { project: ProjectCard; from: HTMLElement | null; locale: Locale; reduce: boolean; onClosed: () => void }

/**
 * Full-screen gallery. The clicked card photo flies to full size, arrows/keys/thumbnails change photo,
 * and on touch screens (or with a mouse drag) the photo follows the finger and swipes to the next one.
 */
export function Viewer({ project: vp, from, locale, reduce, onClosed }: Props) {
  const t = UI[locale]
  const [vi, setVi] = useState(0)
  const dir = useRef(0)
  const ref = useRef<HTMLDivElement>(null)
  const n = vp.images.length

  // Opening: runs before the first paint, so the gallery never flashes open.
  useLayoutEffect(() => {
    document.body.style.overflow = 'hidden'
    getLenis()?.stop()
    const v = ref.current
    if (!v) return
    v.querySelector<HTMLButtonElement>('.v-close')?.focus()
    if (reduce) { gsap.fromTo(v, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }); return }
    const chrome = v.querySelectorAll('.v-top, .v-text, .v-thumbs, .v-nav, .v-hint')
    const src = from?.querySelector<HTMLImageElement>('img')
    const box = v.querySelector<HTMLElement>('.v-img')
    const real = v.querySelector<HTMLImageElement>('.v-photo')
    const tl = gsap.timeline()
    tl.fromTo(v, { backgroundColor: 'rgba(13,19,29,0)' }, { backgroundColor: 'rgba(13,19,29,1)', duration: 0.5, ease: 'power2.out' }, 0)
    if (src && box && real && src.naturalWidth) {
      // A copy of the card photo travels from the card to where the large photo will sit.
      const a = src.getBoundingClientRect(), c = box.getBoundingClientRect()
      const ratio = src.naturalWidth / src.naturalHeight
      const w = Math.min(c.width, c.height * ratio), h = w / ratio
      const ghost = src.cloneNode() as HTMLImageElement
      Object.assign(ghost.style, { position: 'fixed', zIndex: '90', objectFit: 'cover', margin: '0', pointerEvents: 'none', transform: 'none' })
      document.body.appendChild(ghost)
      gsap.set(real, { autoAlpha: 0 })
      tl.fromTo(ghost, { left: a.left, top: a.top, width: a.width, height: a.height, borderRadius: 10 },
        { left: c.left + (c.width - w) / 2, top: c.top + (c.height - h) / 2, width: w, height: h, borderRadius: 4, duration: 0.85, ease: 'expo.inOut' }, 0)
        .set(real, { autoAlpha: 1 })
        .add(() => ghost.remove())
    }
    tl.fromTo(chrome, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' }, 0.55)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const close = useCallback(() => {
    const done = () => {
      document.body.style.overflow = ''
      getLenis()?.start()
      from?.focus({ preventScroll: true })
      onClosed()
    }
    const v = ref.current
    if (reduce || !v) return done()
    gsap.timeline({ onComplete: done })
      .to(v.querySelectorAll('.v-top, .v-text, .v-thumbs, .v-nav, .v-hint'), { autoAlpha: 0, y: 10, duration: 0.2, ease: 'power2.in' }, 0)
      .to(v.querySelector('.v-photo'), { autoAlpha: 0, scale: 0.94, duration: 0.3, ease: 'power2.in' }, 0)
      .to(v, { backgroundColor: 'rgba(13,19,29,0)', duration: 0.35, ease: 'power2.in' }, 0.1)
  }, [reduce, from, onClosed])

  const step = useCallback((d: number) => { if (n < 2) return; dir.current = d; setVi((i) => (i + d + n) % n) }, [n])
  const pick = (i: number) => { dir.current = Math.sign(i - vi); setVi(i) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [close, step])

  // the next photo slides in from the side you are moving towards
  useEffect(() => {
    if (!dir.current) return
    const im = ref.current?.querySelector('.v-photo')
    if (im) gsap.fromTo(im, reduce ? { autoAlpha: 0 } : { autoAlpha: 0, x: 80 * dir.current }, { autoAlpha: 1, x: 0, duration: reduce ? 0.2 : 0.5, ease: 'expo.out' })
    ref.current?.querySelectorAll('.v-thumbs button')[vi]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [vi, reduce])

  /* ---------- swipe: the photo follows the pointer; a short flick or a long drag changes photo ---------- */
  const drag = useRef<{ x: number; y: number; t: number; id: number; moved: boolean } | null>(null)
  const onDown = (e: React.PointerEvent) => {
    if (n < 2 || (e.target as HTMLElement).closest('button')) return
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, moved: false }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    if (!d.moved) {
      if (Math.abs(dx) < 8) return
      if (Math.abs(dy) > Math.abs(dx)) { drag.current = null; return } // vertical: let the page handle it
      d.moved = true
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* pointer already gone */ }
    }
    const im = ref.current?.querySelector<HTMLElement>('.v-photo')
    if (im) gsap.set(im, { x: dx, opacity: 1 - Math.min(Math.abs(dx) / 900, 0.4) })
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d || !d.moved) return
    const dx = e.clientX - d.x, speed = Math.abs(dx) / Math.max(1, performance.now() - d.t)
    const im = ref.current?.querySelector<HTMLElement>('.v-photo')
    const box = ref.current?.querySelector<HTMLElement>('.v-img')
    if (Math.abs(dx) > (box?.offsetWidth || 400) * 0.22 || (speed > 0.5 && Math.abs(dx) > 30)) {
      const d2 = dx < 0 ? 1 : -1
      if (im) gsap.to(im, { x: -d2 * (box?.offsetWidth || 600), opacity: 0, duration: reduce ? 0 : 0.22, ease: 'power2.in', onComplete: () => step(d2) })
      else step(d2)
    } else if (im) gsap.to(im, { x: 0, opacity: 1, duration: 0.35, ease: 'expo.out' })
  }

  const img = vp.images[vi]
  return (
    <div className="viewer open" ref={ref} role="dialog" aria-modal="true" aria-labelledby="vTitle">
      <div className="v-top">
        <div><h3 id="vTitle">{vp.title}</h3><div className="cat">{[t.cat[vp.category], vp.location, vp.year].filter(Boolean).join(' – ')}</div></div>
        <button className="v-close" onClick={close}>{t.close}</button>
      </div>
      <div className="v-stage">
        <div className="v-img" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <img className="v-photo" key={vi} src={img?.large} alt={img?.alt || ''} draggable={false} />
          {n > 1 && <div className="v-nav"><button aria-label={t.prev} onClick={() => step(-1)}>‹</button><button aria-label={t.next} onClick={() => step(1)}>›</button></div>}
          {n > 1 && <p className="v-hint" aria-hidden="true">{t.swipe}</p>}
        </div>
        <div className="v-text"><p className="counter">{vi + 1} / {n}</p><p>{vp.description}</p></div>
      </div>
      <div className="v-thumbs">
        {vp.images.map((im, i) => <button key={i} aria-label={`${i + 1}`} aria-current={i === vi} onClick={() => pick(i)}><img src={im.thumb} alt="" loading="lazy" /></button>)}
      </div>
    </div>
  )
}
