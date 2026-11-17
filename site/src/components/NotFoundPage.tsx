'use client'

import React from 'react'
import type { Shell } from '@/lib/getHomeData'
import { CATS } from '@/lib/cats'
import { categoryPath, homePath, servicePath } from '@/lib/routes'
import { UI } from '@/lib/ui'
import { Icon, IconSprite } from './Icons'
import { Header } from './Header'
import { Footer } from './Footer'
import { usePageMotion } from './PageBits'

export function NotFoundPage({ shell }: { shell: Shell }) {
  const { locale } = shell
  const t = UI[locale]
  usePageMotion()
  return (
    <>
      <IconSprite />
      <Header shell={shell} altHref={locale === 'sq' ? '/en' : '/'} />
      <main>
        <section className="c-hero nf"><div className="pad">
          <h1 className="p-title">{t.nf_h}</h1>
          <p className="p-lead">{t.nf_p}</p>
          <div className="btns"><a className="btn white" href={homePath(locale)}>{t.home}</a><a className="u-link" href={homePath(locale, 'contact')}>{t.nav_contact}</a></div>
        </div></section>
        <section className="section"><div className="pad nf-links">
          <div><h2>{t.nav_services}</h2><ul>{shell.services.map((s) => <li key={s.slug}><a href={servicePath(locale, s.slug)}><span>{s.title}</span><Icon id="i-arrow" /></a></li>)}</ul></div>
          <div><h2>{t.nav_projects}</h2><ul>{CATS.filter((c) => shell.counts[c] > 0).map((c) => <li key={c}><a href={categoryPath(locale, c)}><span>{t.cat[c]}</span><Icon id="i-arrow" /></a></li>)}</ul></div>
        </div></section>
      </main>
      <Footer shell={shell} />
    </>
  )
}
