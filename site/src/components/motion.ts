import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip)

export { gsap, ScrollTrigger, Flip }

// Explicit end states. Every tween is a fromTo so a refresh (fonts/images loading)
// can never re-read a half-animated element as its "end" and freeze it there.
const SHOWN = { autoAlpha: 1, x: 0, y: 0, yPercent: 0, scale: 1 }

/**
 * Every page animation in one place. Content is fully visible without JS;
 * hidden start states only exist inside the motion branch, and reverting the
 * context restores everything.
 *
 * Signature moment: the hero load timeline (headline lines rise, the photo opens
 * behind an RGB scan line, the stats panel lifts). Everything after that is
 * scroll-driven and quieter.
 */
export function setupMotion(reduce: boolean) {
  const splits: SplitText[] = []
  const ctx = gsap.context(() => {
    if (reduce) {
      // Windows/macOS "reduce motion" is on: no movement, no parallax, no smooth scroll —
      // just short fades so the page still feels alive (tiered reduced motion, not a kill switch).
      gsap.fromTo('.proof, .hero h1, .hero .sub, .hero .btns, .hero-media, .stats',
        { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: 'power1.out' })
      const soft = '.about-pic, .about-in > div, .tile-s, #projects .head-row, .card, .fav-card, .client-grid > div, .contact-in > *'
      gsap.set(soft, { autoAlpha: 0 })
      ScrollTrigger.batch(soft, { start: 'top 92%', once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, duration: 0.4, stagger: 0.05, ease: 'power1.out' }) })
      return
    }

    /* ---------- hero: one master timeline ---------- */
    const h1 = SplitText.create('.hero h1', { type: 'lines', mask: 'lines', linesClass: 'h1-line' })
    splits.push(h1)
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 })
    tl.fromTo(h1.lines, { yPercent: 105 }, { yPercent: 0, duration: 1.15, stagger: 0.11 })
      .fromTo('.proof', { autoAlpha: 0, y: 14 }, { ...SHOWN, duration: 0.8 }, 0.25)
      .fromTo('.hero .sub', { autoAlpha: 0, y: 18 }, { ...SHOWN, duration: 0.9 }, 0.45)
      .fromTo('.hero .btns > *', { autoAlpha: 0, y: 14 }, { ...SHOWN, duration: 0.8, stagger: 0.08 }, 0.6)
      // the photo opens from the right while an RGB scan line leads the edge
      .fromTo('.hero-media', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0)
      .fromTo('#scan', { left: '100%', autoAlpha: 1 }, { left: '0%', duration: 1.5, ease: 'expo.inOut' }, 0)
      .set('#scan', { autoAlpha: 0 })
      .fromTo('.hero-media .now', { autoAlpha: 0, y: -10 }, { ...SHOWN, duration: 0.6 }, 1.2)
      .fromTo('.stats > div', { autoAlpha: 0, y: 26 }, { ...SHOWN, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.9)

    // the hero photo drifts slower than the page as it scrolls away
    // (scale grows faster than the shift, so no gap ever opens at the top edge)
    gsap.fromTo('.slides', { yPercent: 0, scale: 1 }, { yPercent: 8, scale: 1.18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })

    /* ---------- scroll progress line in the header ---------- */
    gsap.fromTo('.hdr-progress', { scaleX: 0 }, { scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 } })

    /* ---------- section titles rise out of a mask ---------- */
    gsap.utils.toArray<HTMLElement>('main h2').forEach((el) => {
      const s = SplitText.create(el, { type: 'lines', mask: 'lines' })
      splits.push(s)
      gsap.fromTo(s.lines, { yPercent: 105 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
    })
    gsap.utils.toArray<HTMLElement>('main .pill, main .lede').forEach((el) =>
      gsap.fromTo(el, { autoAlpha: 0, y: 12 }, { ...SHOWN, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }))

    /* ---------- about: photo unveils upward, badge pops ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.about-pic', start: 'top 80%', once: true } })
      .fromTo('.about-pic img', { clipPath: 'inset(100% 0% 0% 0% round 14px)', scale: 1.15 },
        { clipPath: 'inset(0% 0% 0% 0% round 14px)', scale: 1, duration: 1.4, ease: 'expo.inOut' })
      .fromTo('.about-pic .badge', { autoAlpha: 0, y: 20, scale: 0.9 }, { ...SHOWN, duration: 0.7, ease: 'back.out(1.6)' }, '-=0.5')
    // gentle depth: the photo drifts a little slower than the page
    gsap.fromTo('.about-pic', { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } })
    gsap.fromTo('.about p, .checks li, .about .link', { autoAlpha: 0, y: 16 }, { ...SHOWN, duration: 0.7, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: '.about-in', start: 'top 75%', once: true } })

    /* ---------- services: tiles mount like LED cabinets ---------- */
    gsap.set('.tile-s', { clipPath: 'inset(14% 14% 14% 14% round 14px)', autoAlpha: 0 })
    ScrollTrigger.batch('.tile-s', {
      start: 'top 90%',
      once: true,
      onEnter: (els) => {
        gsap.to(els, { clipPath: 'inset(0% 0% 0% 0% round 14px)', autoAlpha: 1, duration: 1.1, stagger: 0.09, ease: 'expo.out' })
        gsap.fromTo(els.map((e) => e.querySelector('img')).filter(Boolean), { scale: 1.3 }, { scale: 1, duration: 1.6, stagger: 0.09, ease: 'expo.out' })
      },
    })

    /* ---------- project cards rise in once; later filter changes are animated by Flip ---------- */
    gsap.fromTo('.card', { autoAlpha: 0, y: 40 }, { ...SHOWN, duration: 0.9, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: '.grid', start: 'top 85%', once: true } })

    /* ---------- FAV: the card scales up to full size, like a screen switching on ---------- */
    gsap.fromTo('.fav-card', { scale: 0.9, borderRadius: 32 }, { scale: 1, borderRadius: 14, ease: 'none',
      scrollTrigger: { trigger: '.fav-card', start: 'top bottom', end: 'top 35%', scrub: 0.6 } })
    // FAV numbers count up (keeps the suffix: 10.5M+, 12h+)
    gsap.utils.toArray<HTMLElement>('.fav-text dt').forEach((el) => {
      const m = el.textContent?.match(/^([\d.]+)(.*)$/)
      if (!m) return
      const end = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, o = { v: 0 }
      gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = o.v.toFixed(dec) + m[2] },
        scrollTrigger: { trigger: '.fav-card', start: 'top 65%', once: true } })
    })
    gsap.fromTo('.fav-text > *', { autoAlpha: 0, y: 18 }, { ...SHOWN, duration: 0.8, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: '.fav-card', start: 'top 65%', once: true } })

    /* ---------- clients and contact: quiet entrances ---------- */
    gsap.set('.client-grid > div', { autoAlpha: 0, y: 16 })
    ScrollTrigger.batch('.client-grid > div', { start: 'top 92%', once: true,
      onEnter: (els) => gsap.to(els, { ...SHOWN, duration: 0.6, stagger: 0.04, ease: 'power2.out' }) })
    gsap.fromTo('.c-list li, .contact .btn.wa-b', { autoAlpha: 0, x: -16 }, { ...SHOWN, duration: 0.7, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-in', start: 'top 75%', once: true } })
    gsap.fromTo('form.cf', { autoAlpha: 0, y: 40 }, { ...SHOWN, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.contact-in', start: 'top 75%', once: true } })

    /* ---------- key numbers count up once ---------- */
    gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count), o = { v: 0 }
      gsap.to(o, { v: end, duration: 2, ease: 'power2.out', delay: 1,
        onUpdate: () => { el.textContent = Math.round(o.v) + '+' },
        scrollTrigger: { trigger: el, start: 'top 95%', once: true } })
    })
  })

  return () => {
    ctx.revert()
    splits.forEach((s) => s.revert())
  }
}
