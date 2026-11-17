'use client'

import React, { useState } from 'react'
import type { CategoryPageData, ProjectCard } from '@/lib/getHomeData'
import { CATS } from '@/lib/cats'
import { categoryPath, homePath, servicePath } from '@/lib/routes'
import { UI } from '@/lib/ui'
import { Icon, IconSprite } from './Icons'
import { Header } from './Header'
import { Footer } from './Footer'
import { Viewer } from './Viewer'
import { ProjectCards, usePageMotion } from './PageBits'

/** All projects of one category. Click a project to open its photos. */
export function CategoryPage({ data, altHref }: { data: CategoryPageData; altHref: string }) {
  const { shell, category, service, projects } = data
  const { locale } = shell
  const t = UI[locale]
  const reduce = usePageMotion()
  const [vp, setVp] = useState<{ p: ProjectCard; from: HTMLElement | null } | null>(null)

  return (
    <>
      <IconSprite />
      <Header shell={shell} altHref={altHref} cur={`c:${category}`} />
      <main>
        <section className="c-hero"><div className="pad">
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href={homePath(locale)}>{t.home}</a><span aria-hidden="true">/</span>
            <a href={homePath(locale, 'projects')}>{t.nav_projects}</a>
          </nav>
          <div className="c-hero-row">
            <div>
              <h1 className="p-title">{t.cat[category]}</h1>
              {service?.lead && <p className="p-lead">{service.lead}</p>}
            </div>
            <div className="c-side">
              {service && <a className="u-link" href={servicePath(locale, service.slug)}>{t.about_service}</a>}
            </div>
          </div>
          <nav className="c-tabs" aria-label={t.other_cats}>
            {CATS.filter((c) => shell.counts[c] > 0).map((c) => (
              <a key={c} href={categoryPath(locale, c)} aria-current={c === category ? 'page' : undefined}>{t.cat[c]}</a>
            ))}
          </nav>
        </div></section>

        <section className="section c-list"><div className="pad">
          {projects.length === 0 ? <p className="empty">{t.empty}</p>
            : <ProjectCards projects={projects} locale={locale} onOpen={(p, from) => setVp({ p, from })} />}
          {service && (
            <div className="more-row"><a className="btn outline" href={servicePath(locale, service.slug)}><span>{t.about_service}: {service.title}</span><Icon id="i-arrow" /></a></div>
          )}
        </div></section>
      </main>
      <Footer shell={shell} />
      {vp && <Viewer project={vp.p} from={vp.from} locale={locale} reduce={reduce} onClosed={() => setVp(null)} />}
    </>
  )
}
