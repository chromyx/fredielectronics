'use client'

import React from 'react'
import type { Shell } from '@/lib/getHomeData'
import { homePath, servicePath } from '@/lib/routes'
import { UI } from '@/lib/ui'
import { Icon } from './Icons'

export function Footer({ shell, favLink = 'https://fav.al/', onJump }: { shell: Shell; favLink?: string; onJump?: (id: string) => void }) {
  const { locale, settings, services } = shell
  const t = UI[locale]
  const wa = `https://wa.me/${settings.whatsapp}`
  const nav: [string, string][] = [['about', t.nav_about], ['fav', 'FAV × TEG'], ['projects', t.nav_projects], ['contact', t.nav_contact]]
  const link = (id: string) => ({ href: homePath(locale, id), onClick: (e: React.MouseEvent) => { if (onJump) { e.preventDefault(); onJump(id) } } })
  return (
    <>
      <footer className="foot">
        <div className="foot-in pad">
          <div>
            <img src="/brand/logo-black.png" alt="Fredi Electronics" />
            <p>Fredi Electronics sh.p.k.<br />{settings.address}<br /><a href={`tel:+${settings.whatsapp}`}>{settings.phone}</a><br /><a href={`mailto:${settings.email}`}>{settings.email}</a></p>
          </div>
          <div><h4>{t.f_nav}</h4><ul>{nav.map(([id, label]) => <li key={id}><a {...link(id)}>{label}</a></li>)}</ul></div>
          <div><h4>{t.nav_services}</h4><ul>{services.map((s) => <li key={s.slug}><a href={servicePath(locale, s.slug)}>{s.title}</a></li>)}</ul></div>
          <div><h4>{t.f_follow}</h4><ul>
            {settings.instagram && <li><a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener">Instagram</a></li>}
            {settings.facebook && <li><a href={settings.facebook} target="_blank" rel="noopener">Facebook</a></li>}
            {settings.linkedin && <li><a href={settings.linkedin} target="_blank" rel="noopener">LinkedIn</a></li>}
            <li><a href={wa} target="_blank" rel="noopener">WhatsApp</a></li>
            <li><a href={favLink} target="_blank" rel="noopener">fav.al</a></li>
          </ul></div>
        </div>
        <div className="foot-bot pad"><span>© {new Date().getFullYear()} Fredi Electronics sh.p.k.</span><span>{t.f_where}</span></div>
      </footer>
      <a className="wa" href={wa} target="_blank" rel="noopener" aria-label="WhatsApp"><Icon id="i-wa" /><span className="t">{t.wa_short}</span></a>
    </>
  )
}
