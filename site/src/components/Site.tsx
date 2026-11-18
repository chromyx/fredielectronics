'use client'

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, setupMotion } from './motion'
import type { Category, HomeData, ProjectCard } from '@/lib/getHomeData'
import { CATS } from '@/lib/cats'
import { servicePath } from '@/lib/routes'
import { UI } from '@/lib/ui'
import { Icon, IconSprite, Socials } from './Icons'
import { Header } from './Header'
import { Footer } from './Footer'
import { Viewer } from './Viewer'
import { setLenis } from './scroll'
const FIRST = 9
const HOLD = 6500

export function Site({ data }: { data: HomeData }) {
  const { locale, projects, home, settings, partners, services } = data
  const t = UI[locale]
  const other = locale === 'sq' ? '/en' : '/'
  const wa = `https://wa.me/${settings.whatsapp}`
  const hours = settings.hours || t.c_hours_tbc

  const [reduce, setReduce] = useState(false)
  const lenisRef = useRef<Lenis | null>(null)
  const hdrRef = useRef<HTMLElement>(null)
  const [cur, setCur] = useState('')

  /* ---------- motion setup: smooth scroll + all animations (see motion.ts) ---------- */
  useEffect(() => {
    document.documentElement.lang = locale
    const r = matchMedia('(prefers-reduced-motion: reduce)').matches && !new URLSearchParams(location.search).has('motion')
    setReduce(r)
    // CSS uses this class to decide between full motion and the softened version
    document.documentElement.classList.toggle('motion', !r)
    let lenis: Lenis | null = null
    const raf = (time: number) => lenis?.raf(time * 1000)
    if (!r) {
      lenis = new Lenis({ lerp: 0.1 })
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(raf)
      gsap.ticker.lagSmoothing(0)
      lenisRef.current = lenis
      setLenis(lenis)
    }
    // Start one frame later: React dev mode mounts twice, and a cancelled first run must never touch the DOM.
    let undoMotion = () => {}
    const motionFrame = requestAnimationFrame(() => { undoMotion = setupMotion(r) })
    const hdrH = () => (hdrRef.current?.offsetHeight || 80) + 10
    const triggers = ['about', 'services', 'projects', 'contact'].map((id) =>
      ScrollTrigger.create({ trigger: '#' + id, start: () => 'top ' + hdrH(), end: () => 'bottom ' + hdrH(),
        onToggle: (st) => setCur((c) => (st.isActive ? id : c === id ? '' : c)) }))
    return () => {
      cancelAnimationFrame(motionFrame)
      undoMotion()
      triggers.forEach((s) => s.kill())
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenisRef.current = null
      setLenis(null)
    }
  }, [locale])

  const scrollToId = useCallback((id: string, then?: () => void) => {
    const el = document.getElementById(id)
    if (!el) return
    const off = -(hdrRef.current?.offsetHeight || 80) + 1
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: off, duration: 1.1, onComplete: () => then?.() })
    else { scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: 'smooth' }); if (then) setTimeout(then, 650) }
  }, [])
  const jump = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); scrollToId(id) }

  /* ---------- hero slideshow ---------- */
  const slides = useMemo(() => {
    const f = projects.filter((p) => p.featured && p.hero)
    return (f.length ? f : projects.filter((p) => p.hero).slice(0, 6)).slice(0, 10)
  }, [projects])
  const [{ idx, prev }, setSlide] = useState({ idx: 0, prev: -1 })
  const t0 = useRef(0)
  const go = useCallback((n: number) => {
    setSlide((s) => {
      const next = (n + slides.length) % slides.length
      return next === s.idx ? s : { idx: next, prev: s.idx }
    })
    t0.current = performance.now()
  }, [slides.length])
  useEffect(() => {
    if (prev < 0 || reduce) return
    gsap.fromTo('#scan', { left: '0%', opacity: 1 }, { left: '100%', duration: 1.4, ease: 'power3.inOut', onComplete: () => { gsap.set('#scan', { opacity: 0 }) } })
  }, [idx, prev, reduce])
  const idxRef = useRef(0)
  useEffect(() => { idxRef.current = idx }, [idx])
  useEffect(() => {
    if (!slides.length) return
    t0.current = performance.now()
    let id = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0.current) / HOLD), at = idxRef.current
      document.querySelectorAll<HTMLElement>('#bars b').forEach((b, i) => {
        b.style.transform = `scaleX(${i < at ? 1 : i === at ? p : 0})`
      })
      if (p >= 1) go(at + 1)
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [slides.length, go])

  /* ---------- projects ---------- */
  const [filter, setFilter] = useState<'all' | Category>('all')
  const [showAll, setShowAll] = useState(false)
  const list = filter === 'all' ? projects : projects.filter((p) => p.category === filter)
  const shown = filter === 'all' && !showAll ? list.slice(0, FIRST) : list
  const gridRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const indRef = useRef<HTMLSpanElement>(null)
  const switching = useRef<{ height: number; keep: Set<string> } | null>(null)
  const busy = useRef(false)

  // The highlight behind the active filter slides to whichever button is pressed.
  useLayoutEffect(() => {
    const btn = filtersRef.current?.querySelector<HTMLElement>('button[aria-pressed="true"]')
    const ind = indRef.current
    if (!btn || !ind) return
    const to = { x: btn.offsetLeft, y: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight }
    if (reduce || !ind.dataset.ready) gsap.set(ind, to)
    else gsap.to(ind, { ...to, duration: 0.55, ease: 'expo.out' })
    ind.dataset.ready = '1'
  }, [filter, reduce, locale])

  // Old cards drop away, then the new set rises in with its photos unveiling (layout effect below).
  const changeFilter = (c: 'all' | Category, all = false) => {
    if (busy.current || (c === filter && all === showAll)) return
    const grid = gridRef.current
    const cards = grid ? [...grid.querySelectorAll<HTMLElement>('.card')] : []
    const growOnly = c === filter && all // "show all": keep what is there, only add the rest
    switching.current = { height: grid?.offsetHeight || 0, keep: new Set(growOnly ? cards.map((el) => el.dataset.id || '') : []) }
    const apply = () => { setFilter(c); setShowAll(all); busy.current = false }
    if (growOnly || !cards.length) return apply()
    busy.current = true
    gsap.to(cards, reduce
      ? { autoAlpha: 0, duration: 0.15, onComplete: apply }
      : { autoAlpha: 0, y: -18, scale: 0.97, duration: 0.3, ease: 'power2.in', stagger: { each: 0.025, from: 'start' }, onComplete: apply })
  }
  useLayoutEffect(() => {
    const sw = switching.current, grid = gridRef.current
    if (!sw || !grid) return
    switching.current = null
    const fresh = [...grid.querySelectorAll<HTMLElement>('.card')].filter((el) => !sw.keep.has(el.dataset.id || ''))
    // the grid's height eases to its new size, so the sections below glide instead of jumping
    gsap.fromTo(grid, { height: sw.height }, { height: grid.scrollHeight, duration: reduce ? 0.2 : 0.6, ease: 'power3.inOut', clearProps: 'height', onComplete: () => { ScrollTrigger.refresh() } })
    if (reduce) {
      gsap.fromTo(fresh, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.03, clearProps: 'opacity,visibility' })
      return
    }
    gsap.fromTo(fresh, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out', delay: 0.05, clearProps: 'transform,opacity,visibility' })
    gsap.fromTo(fresh.map((el) => el.querySelector('.ph')), { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, stagger: 0.06, ease: 'expo.out', delay: 0.05, clearProps: 'clipPath' })
    gsap.fromTo(fresh.map((el) => el.querySelector('img')), { scale: 1.2 }, { scale: 1, duration: 1.2, stagger: 0.06, ease: 'expo.out', delay: 0.05, clearProps: 'transform' })
  }, [filter, showAll, reduce])

  /* ---------- gallery viewer (see Viewer.tsx) ---------- */
  const [vp, setVp] = useState<{ p: ProjectCard; from: HTMLElement | null } | null>(null)
  const openViewer = (p: ProjectCard, from?: HTMLElement | null) => { if (p.images.length) setVp({ p, from: from || null }) }

  /* ---------- FAV sample screen ---------- */
  const [ad, setAd] = useState(0)
  useEffect(() => {
    // Reduced motion (e.g. Windows "Animation effects" off): still rotate the slides with a plain
    // crossfade every 4s, just without the moving progress bar.
    if (reduce) {
      const t = setTimeout(() => setAd((a) => (a + 1) % 3), 4000)
      return () => clearTimeout(t)
    }
    const tw = gsap.fromTo('#tick', { width: '0%' }, { width: '100%', duration: 3, ease: 'none', onComplete: () => setAd((a) => (a + 1) % 3) })
    return () => { tw.kill() }
  }, [ad, reduce])

  /* ---------- contact form ---------- */
  const [form, setForm] = useState({ name: '', contact: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'missing'>('idle')
  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim() || !form.message.trim()) return setStatus('missing')
    setStatus('sending')
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent'); setForm({ name: '', contact: '', message: '' })
    } catch { setStatus('error') }
  }

  // the confirmation pops in so it is clear the message went through
  useEffect(() => {
    if (status !== 'sent') return
    gsap.fromTo('.form-note.ok', { autoAlpha: 0, y: 10, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: reduce ? 0.2 : 0.6, ease: 'back.out(1.7)' })
  }, [status, reduce])

  const faces = projects.filter((p) => p.cover).slice(0, 3)
  const aboutPhoto = home.aboutPhoto || projects[3]?.cover || projects[0]?.cover

  return (
    <>
      <IconSprite />
      <Header shell={data} altHref={other} onJump={scrollToId} cur={cur} hdrRef={hdrRef} />

      <main id="top">
        <section className="hero" aria-label="Fredi Electronics">
          <div className="hero-in">
            <div className="hero-text">
              <div className="proof">
                <span className="faces">{faces.map((p) => <img key={p.id} src={p.cover!.thumb} alt="" />)}</span>
                <span dangerouslySetInnerHTML={{ __html: t.proof(settings.projectsDone) }} />
              </div>
              <h1>{home.heroLine1}<br />{home.heroLine2}</h1>
              <p className="sub">{home.heroText}</p>
              <div className="btns">
                <a className="btn white" href="#projects" onClick={jump('projects')}>{t.see_projects}</a>
                <a className="u-link" href="#services" onClick={jump('services')}>{t.our_services}</a>
              </div>
            </div>
            <div className="hero-media">
              <div className="slides">
                {slides.map((p, i) => (
                  <img key={p.id} src={p.hero!.large} alt="" fetchPriority={i === 0 ? 'high' : 'low'}
                    className={i === idx ? (prev < 0 ? 'on first' : 'on') : i === prev ? 'prev' : undefined} />
                ))}
              </div>
              <div className="scan" id="scan"><i /><i /><i /></div>
              {slides.length > 0 && (
                <div className="now">
                  <span className="title">{slides[idx]?.title}</span>
                  <span className="bars" id="bars">
                    {slides.map((p, i) => <button key={p.id} aria-label={`${i + 1}`} onClick={() => go(i)}><b /></button>)}
                  </span>
                  <a href="#" onClick={(e) => { e.preventDefault(); openViewer(slides[idx], e.currentTarget) }}>{t.open}</a>
                </div>
              )}
            </div>
          </div>
          <div className="stats">
            <div><b>{settings.founded}</b><span>{t.f_year}</span></div>
            <div><b data-count={settings.projectsDone}>{settings.projectsDone}+</b><span>{t.f_proj}</span></div>
            <div><b data-count={settings.brands}>{settings.brands}+</b><span>{t.f_brands}</span></div>
            <div><b>{t.f_where_v}</b><span>{t.f_where}</span></div>
          </div>
        </section>

        <section className="section about" id="about"><div className="about-in pad">
          <div className="about-pic">
            {aboutPhoto && <img src={aboutPhoto.card} alt={aboutPhoto.alt} loading="lazy" />}
            <div className="badge"><b>{settings.brands}+</b><span>{t.badge}</span></div>
          </div>
          <div >
            <span className="pill">{t.nav_about}</span>
            <h2>{home.aboutTitle}</h2>
            {home.aboutText1 && <p>{home.aboutText1}</p>}
            {home.aboutText2 && <p>{home.aboutText2}</p>}
            {home.aboutPoints.length > 0 && <ul className="checks">{home.aboutPoints.map((x, i) => <li key={i}>{x}</li>)}</ul>}
            <a className="link" href="#projects" onClick={jump('projects')}><span>{t.see_projects}</span><Icon id="i-arrow" /></a>
          </div>
        </div></section>

        <section className="section services" id="services"><div className="pad">
          <div className="mosaic">
            <div className="tile-s intro">
              <div><h2>{t.nav_services}</h2><p style={{ marginTop: 8 }}>{home.servicesIntro}</p></div>
              <ol>{home.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </div>
            {services.map((s) => (
              <a key={s.slug} className="tile-s" href={servicePath(locale, s.slug)}>
                {s.photo && <img src={s.photo.card} alt="" loading="lazy" />}
                <span className="go"><Icon id="i-arrow" /></span><h3>{s.title}</h3><p>{s.lead}</p>
              </a>
            ))}
            <a className="tile-s favt" href="#fav" onClick={jump('fav')}>
              <span className="go"><Icon id="i-arrow" /></span><h3>FAV × TEG</h3><p>{t.fav_tile}</p>
            </a>
          </div>
        </div></section>

        <section className="section" id="projects"><div className="pad">
          <div className="head-row">
            <div><span className="pill">{t.nav_projects}</span><h2>{home.projectsTitle}</h2></div>
            <p className="lede">{home.projectsText}</p>
          </div>
          <div className="filters" role="group" ref={filtersRef}>
            <span className="filter-ind" ref={indRef} aria-hidden="true" />
            {(['all', ...CATS] as const).map((c) => (
              <button key={c} aria-pressed={filter === c} onClick={() => changeFilter(c)}>
                {c === 'all' ? t.all : t.cat[c]}
              </button>
            ))}
          </div>
          {shown.length === 0 && <p className="empty">{t.empty}</p>}
          <div className="grid" ref={gridRef}>
            {shown.map((p) => (
              <article key={p.id} data-id={p.id} className="card" tabIndex={0}
                onClick={(e) => openViewer(p, e.currentTarget)} onKeyDown={(e) => { if (e.key === 'Enter') openViewer(p, e.currentTarget) }}>
                <div className="ph">{p.cover && <img src={p.cover.card} alt={p.cover.alt} loading="lazy" />}</div>
                <div className="body">
                  <div className="meta"><span className="tag">{t.cat[p.category]}</span><span>{t.photos(p.images.length)}</span></div>
                  <h3>{p.title}</h3>
                </div>
              </article>
            ))}
          </div>
          {shown.length < list.length && <div className="more-row"><button className="btn outline" onClick={() => changeFilter(filter, true)}>{t.show_all}</button></div>}
        </div></section>

        <section className="section" id="fav" style={{ paddingTop: 0 }}><div className="pad">
          <div className="fav-card">
            <div className="fav-text">
              <span className="pill">FAV × TEG</span>
              <h2>FAV Digital Advertising Network<small>{home.favSubtitle}</small></h2>
              <p>{home.favText}</p>
              <dl>{home.favStats.map((s, i) => <div key={i}><dt>{s.value}</dt><dd>{s.label}</dd></div>)}</dl>
              <a className="btn navy" href={home.favLink} target="_blank" rel="noopener"><span>{t.fav_btn}</span><Icon id="i-out" /></a>
            </div>
            <div className={`fav-side${home.favPhoto ? ' has-photo' : ''}`}>
              {home.favPhoto && <img className="fav-photo" src={home.favPhoto.large} alt={home.favPhoto.alt} loading="lazy" />}
              {(
                <div className="screen" aria-hidden="true">
                  <div className={`slide s1${ad === 0 ? ' on' : ''}`}><strong>{t.ad1}</strong><span>FAV · TEG</span></div>
                  <div className={`slide s2${ad === 1 ? ' on' : ''}`}><strong>{t.ad2}</strong><span>{t.ad2s}</span></div>
                  <div className={`slide s3${ad === 2 ? ' on' : ''}`}><strong>{t.ad3}</strong><span>fav.al</span></div>
                  <div className="tick" id="tick" />
                </div>
              )}
            </div>
          </div>
        </div></section>

        {partners.length > 0 && (
          <section className="section clients partners-home"><div className="pad">
            <div className="head-row"><div><span className="pill">{t.partners}</span><h2>{t.partners_h}</h2></div><p className="lede">{t.partners_home}</p></div>
            <div className="client-grid">
              {partners.map((b) => <div key={b.name}><img src={b.logo!.thumb} alt={b.name} loading="lazy" /><span>{b.name}</span></div>)}
            </div>
          </div></section>
        )}

        <section className="section contact" id="contact"><div className="contact-in pad">
          <div >
            <span className="pill">{t.nav_contact}</span>
            <h2>{home.contactTitle}</h2>
            <p className="lede">{home.contactText}</p>
            <ul className="c-list">
              <li><span className="ic"><Icon id="i-pin" /></span><div><small>{t.c_addr}</small>{settings.address}</div></li>
              <li><span className="ic"><Icon id="i-phone" /></span><div><small>{t.c_phone}</small><a href={`tel:+${settings.whatsapp}`}>{settings.phone}</a></div></li>
              <li><span className="ic"><Icon id="i-mail" /></span><div><small>Email</small><a href={`mailto:${settings.email}`}>{settings.email}</a>{settings.email2 && <><br /><a href={`mailto:${settings.email2}`}>{settings.email2}</a></>}</div></li>
              <li><span className="ic"><Icon id="i-clock" /></span><div><small>{t.c_hours}</small><span className="hours">{hours}</span></div></li>
            </ul>
            <div className="c-actions">
              <a className="btn wa-b" href={wa} target="_blank" rel="noopener"><Icon id="i-wa" /><span>{t.wa_long}</span></a>
              <Socials settings={settings} className="c-social" />
            </div>
          </div>
          <form className="cf" onSubmit={send} noValidate>
            <h3>{t.fm_h}</h3>
            <div className="row2">
              <label><span>{t.fm_name}</span><input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label><span>{t.fm_contact}</span><input autoComplete="email" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></label>
            </div>
            <label><span>{t.fm_msg}</span><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
            {status === 'sent' && <p className="form-note ok" role="status">{t.fm_sent}</p>}
            {status === 'error' && <p className="form-note err" role="alert">{t.fm_error}</p>}
            {status === 'missing' && <p className="form-note err" role="alert">{t.fm_missing}</p>}
            <button className="btn navy" disabled={status === 'sending'}>{status === 'sending' ? t.fm_sending : t.fm_send}</button>
          </form>
        </div></section>
      </main>

      <Footer shell={data} favLink={home.favLink} onJump={scrollToId} />
      {vp && <Viewer project={vp.p} from={vp.from} locale={locale} reduce={reduce} onClosed={() => setVp(null)} />}

      <a href={other} className="sr">{locale === 'sq' ? 'English' : 'Shqip'}</a>
    </>
  )
}
