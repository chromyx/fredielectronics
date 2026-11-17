'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { Shell } from '@/lib/getHomeData'
import { CATS } from '@/lib/cats'
import { categoryPath, homePath, servicePath } from '@/lib/routes'
import { UI } from '@/lib/ui'
import { Icon, Socials } from './Icons'

type Props = {
  shell: Shell
  /** link to the same page in the other language */
  altHref: string
  /** on the homepage: scrolls to a section instead of following the link */
  onJump?: (id: string) => void
  /** highlighted menu item */
  cur?: string
  hdrRef?: React.RefObject<HTMLElement | null>
}

type Menu = 'services' | 'projects' | null

/**
 * Top bar + sticky header. "Shërbimet tona" and "Projekte" open a panel on hover or click (desktop)
 * and fold open in place on phones.
 */
export function Header({ shell, altHref, onJump, cur, hdrRef }: Props) {
  const { locale, settings, services, counts } = shell
  const t = UI[locale]
  const [menuOpen, setMenuOpen] = useState(false)
  const [open, setOpen] = useState<Menu>(null)
  const [scrolled, setScrolled] = useState(false)
  const own = useRef<HTMLElement>(null)
  const ref = hdrRef || own
  const closeTimer = useRef(0)

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 50)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(null); setMenuOpen(false) } }
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(null) }
    addEventListener('keydown', onKey)
    addEventListener('pointerdown', onDown)
    return () => { removeEventListener('scroll', onScroll); removeEventListener('keydown', onKey); removeEventListener('pointerdown', onDown) }
  }, [ref])

  // Phone menu covers the page: stop the page underneath from scrolling.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const link = (id: string) => ({
    href: homePath(locale, id),
    onClick: (e: React.MouseEvent) => {
      setMenuOpen(false); setOpen(null)
      if (onJump) { e.preventDefault(); onJump(id) }
    },
  })
  const desktop = () => typeof window !== 'undefined' && matchMedia('(hover: hover) and (min-width: 1081px)').matches
  const enter = (m: Menu) => () => { if (!desktop()) return; clearTimeout(closeTimer.current); setOpen(m) }
  const leave = () => { if (!desktop()) return; closeTimer.current = window.setTimeout(() => setOpen(null), 160) }
  const toggle = (m: Menu) => () => setOpen((o) => (o === m ? null : m))

  return (
    <>
      <div className="topbar"><div className="in pad">
        <a href={`tel:+${settings.whatsapp}`}><Icon id="i-phone" />{settings.phone}</a>
        <a href={`mailto:${settings.email}`} className="hide-m"><Icon id="i-mail" />{settings.email}</a>
        <a {...link('contact')} className="hide-m"><Icon id="i-pin" />{settings.address.split(',').slice(0, 1).join('')}, Tiranë</a>
        <span className="sp" />
        <Socials settings={settings} className="tb-social hide-m" />
        <div className="lang" role="group" aria-label="Language">
          <a href={locale === 'sq' ? '#' : altHref} className="lang-b" aria-current={locale === 'sq'}>SQ</a>
          <a href={locale === 'en' ? '#' : altHref} className="lang-b" aria-current={locale === 'en'}>EN</a>
        </div>
      </div></div>

      <header className={`hdr${scrolled ? ' scrolled' : ''}${open ? ' has-panel' : ''}`} ref={ref}><div className="in pad">
        <a className="logo" href={homePath(locale)} aria-label="Fredi Electronics"><img src="/brand/logo-black.png" alt="Fredi Electronics" /></a>
        <nav className={`nav${menuOpen ? ' open' : ''}`} aria-label={t.menu}
          style={{ ['--hdr-h' as string]: menuOpen ? `${ref.current?.getBoundingClientRect().bottom || 114}px` : undefined }}>
          <a {...link('about')} className={cur === 'about' ? 'cur' : undefined}>{t.nav_about}</a>

          <div className={`dd${open === 'services' ? ' open' : ''}`} onPointerEnter={enter('services')} onPointerLeave={leave}>
            <button className={`dd-btn${cur === 'services' ? ' cur' : ''}`} aria-expanded={open === 'services'} aria-controls="dd-services" onClick={toggle('services')}>
              {t.nav_services}<span className="chev" aria-hidden="true" />
            </button>
            <div className="dd-panel wide" id="dd-services">
              <ul>
                {services.map((s) => (
                  <li key={s.slug}><a href={servicePath(locale, s.slug)} aria-current={cur === `s:${s.slug}` ? 'page' : undefined}>
                    <b>{s.title}</b><span>{s.lead}</span>
                  </a></li>
                ))}
              </ul>
            </div>
          </div>

          <a {...link('fav')} className="fav-l">FAV × TEG</a>

          <div className={`dd${open === 'projects' ? ' open' : ''}`} onPointerEnter={enter('projects')} onPointerLeave={leave}>
            <button className={`dd-btn${cur === 'projects' ? ' cur' : ''}`} aria-expanded={open === 'projects'} aria-controls="dd-projects" onClick={toggle('projects')}>
              {t.nav_projects}<span className="chev" aria-hidden="true" />
            </button>
            <div className="dd-panel" id="dd-projects">
              <ul>
                {CATS.filter((c) => counts[c] > 0).map((c) => (
                  <li key={c}><a href={categoryPath(locale, c)} aria-current={cur === `c:${c}` ? 'page' : undefined}>
                    <b>{t.cat[c]}</b>
                  </a></li>
                ))}
                <li className="all"><a {...link('projects')}><b>{t.all_projects}</b><Icon id="i-arrow" /></a></li>
              </ul>
            </div>
          </div>

          <a {...link('contact')} className={cur === 'contact' ? 'cur' : undefined}>{t.nav_contact}</a>
          <a {...link('contact')} className="btn navy">{t.talk}</a>
        </nav>
        <span className="hdr-progress" aria-hidden="true" />
        <button className="menu-btn" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>{menuOpen ? t.close : t.menu}</button>
      </div></header>
    </>
  )
}
