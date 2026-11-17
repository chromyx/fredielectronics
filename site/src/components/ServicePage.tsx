'use client'

import React, { useEffect, useState } from 'react'
import type { ProjectCard, ServicePageData } from '@/lib/getHomeData'
import { categoryPath, homePath, servicePath } from '@/lib/routes'
import { UI } from '@/lib/ui'
import { Icon, IconSprite } from './Icons'
import { Header } from './Header'
import { Footer } from './Footer'
import { Viewer } from './Viewer'
import { ProjectCards, usePageMotion } from './PageBits'
import { HeroWall } from './HeroWall'

/** One service: what it is, what we offer (with photos), partner brands and the projects that prove it. */
export function ServicePage({ data, altHref }: { data: ServicePageData; altHref: string }) {
  const { shell, service: s, projects } = data
  const { locale, settings } = shell
  const t = UI[locale]
  const reduce = usePageMotion()
  const [vp, setVp] = useState<{ p: ProjectCard; from: HTMLElement | null } | null>(null)
  const wa = (text: string) => `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(t.offer_msg(text))}`

  // the side index marks the section currently on screen
  const [here, setHere] = useState(0)
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('.offer[data-i]')]
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setHere(Number((e.target as HTMLElement).dataset.i)) }),
      { rootMargin: '-40% 0px -55% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <IconSprite />
      <Header shell={shell} altHref={altHref} cur={`s:${s.slug}`} />
      <main>
        <section className="p-hero">
          <div className="p-hero-in pad">
            <div className="p-hero-text">
              <nav className="crumbs" aria-label="Breadcrumb">
                <a href={homePath(locale)}>{t.home}</a><span aria-hidden="true">/</span>
                <a href={homePath(locale, 'services')}>{t.nav_services}</a>
              </nav>
              <h1 className="p-title">{s.title}</h1>
              <p className="p-lead">{s.lead}</p>
              <div className="btns">
                <a className="btn white" href={wa(s.title)} target="_blank" rel="noopener"><Icon id="i-wa" /><span>{t.offer}</span></a>
                {s.category && projects.length > 0 && <a className="u-link" href="#work">{t.projects_of(t.cat[s.category])}</a>}
              </div>
            </div>
            {s.products.length > 0 ? (
              <div className="p-hero-media prods">
                {s.products.map((im, i) => <figure key={i}><img src={im.card} alt={im.alt} /></figure>)}
              </div>
            ) : (
              <HeroWall images={[...(s.photo ? [s.photo] : []), ...s.side]} reduce={reduce} />
            )}
          </div>
          {s.highlights.length > 0 && (
            <dl className="p-facts">
              {s.highlights.map((h, i) => <div key={i}><dt>{h.title}</dt><dd>{h.text}</dd></div>)}
            </dl>
          )}
        </section>

        {s.intro.length > 0 && (
          <section className={`p-about${s.highlights.length ? ' after-facts' : ''}`}><div className="pad offers-in">
            <h2>{t.about_service}</h2>
            <div className="p-about-text">{s.intro.map((x, i) => <p key={i}>{x}</p>)}</div>
          </div></section>
        )}

        <section className="section offers"><div className="pad offers-in">
          <aside className="o-index">
            <h2>{t.we_offer}</h2>
            <ol>
              {s.subsections.map((x, i) => (
                <li key={i}><a href={`#o${i + 1}`} aria-current={here === i ? 'true' : undefined}>{x.title}</a></li>
              ))}
            </ol>
          </aside>
          <div className="o-list">
            {s.subsections.map((x, i) => (
              <article key={i} className="offer" id={`o${i + 1}`} data-i={i}>
                <div className="o-head">
                  <h3>{x.title}</h3>
                  <a className="o-ask" href={wa(`${s.title} – ${x.title}`)} target="_blank" rel="noopener">{t.offer}</a>
                </div>
                {x.text && <p>{x.text}</p>}
                {x.items.length > 0 && <ul className="o-items">{x.items.map((it, j) => <li key={j}>{it}</li>)}</ul>}
                {x.photos.length > 0 && (
                  <div className={`o-photos n${x.photos.length}`}>
                    {x.photos.map((im, j) => (
                      <figure key={j} className={im.product ? 'prod' : 'shot'}>
                        <img src={im.card} alt={im.alt} loading="lazy" />
                        {im.product && im.alt && <figcaption>{im.alt}</figcaption>}
                      </figure>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div></section>

        {s.partners.length > 0 && (
          <section className="section partners"><div className="pad">
            <div className="head-row"><div><h2>{t.partners}</h2></div><p className="lede">{t.partners_text}</p></div>
            <ul className="brand-grid">
              {s.partners.map((b) => <li key={b.name} title={b.name}>{b.logo ? <img src={b.logo.thumb} alt={b.name} loading="lazy" /> : <span>{b.name}</span>}</li>)}
            </ul>
          </div></section>
        )}

        {s.category && projects.length > 0 && (
          <section className="section" id="work"><div className="pad">
            <div className="head-row">
              <div><h2>{t.projects_of(t.cat[s.category])}</h2></div>
              <a className="link" href={categoryPath(locale, s.category)}><span>{t.see_cat}</span><Icon id="i-arrow" /></a>
            </div>
            <ProjectCards projects={projects.slice(0, 6)} locale={locale} onOpen={(p, from) => setVp({ p, from })} />
          </div></section>
        )}

        <section className="cta-band"><div className="pad cta-in">
          <div><h2>{t.cta_h}</h2><p>{t.cta_p}</p></div>
          <div className="cta-btns">
            <a className="btn wa-b" href={wa(s.title)} target="_blank" rel="noopener"><Icon id="i-wa" /><span>{t.wa_long}</span></a>
            <a className="btn white" href={`mailto:${settings.email}?subject=${encodeURIComponent(s.title)}`}><Icon id="i-mail" /><span>{settings.email}</span></a>
          </div>
        </div></section>

        <nav className="svc-next pad" aria-label={t.all_services}>
          {shell.services.filter((x) => x.slug !== s.slug).map((x) => (
            <a key={x.slug} href={servicePath(locale, x.slug)}><span>{x.title}</span><Icon id="i-arrow" /></a>
          ))}
        </nav>
      </main>
      <Footer shell={shell} />
      {vp && <Viewer project={vp.p} from={vp.from} locale={locale} reduce={reduce} onClosed={() => setVp(null)} />}
    </>
  )
}
