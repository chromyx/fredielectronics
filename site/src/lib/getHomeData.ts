import { getPayload } from 'payload'
import config from '@payload-config'
import { CATS } from './cats'

export type Locale = 'sq' | 'en'
export type Category = 'led' | 'av' | 'conf' | 'sec' | 'power'
export type Img = { id?: number | string; thumb: string; card: string; large: string; alt: string }
export type ProjectCard = {
  id: number | string
  slug: string
  title: string
  category: Category
  description: string
  client?: string
  location?: string
  year?: number
  featured: boolean
  cover: Img | null
  hero: Img | null
  images: Img[]
}
export type ServiceLink = { slug: string; title: string; lead: string; category?: Category; photo: Img | null }
export type Settings = {
  phone: string; whatsapp: string; email: string; instagram: string; facebook: string; linkedin: string; address: string; hours: string
  founded: number; projectsDone: number; brands: number
}
/** What every page needs for the header, menus and footer. */
export type Shell = { locale: Locale; settings: Settings; services: ServiceLink[]; counts: Record<Category, number> }
export type HomeData = Awaited<ReturnType<typeof getHomeData>>
export type ServicePageData = NonNullable<Awaited<ReturnType<typeof getServicePage>>>
export type CategoryPageData = NonNullable<Awaited<ReturnType<typeof getCategoryPage>>>

type MediaDoc = {
  id?: number | string
  url?: string | null
  alt?: string | null
  sizes?: Record<string, { url?: string | null } | undefined> | null
}

// Payload returns either a populated media doc or just its id; only docs are usable.
function toImg(m: unknown): Img | null {
  if (!m || typeof m !== 'object') return null
  const d = m as MediaDoc
  if (!d.url) return null
  const s = d.sizes || {}
  return { id: d.id, thumb: s.thumb?.url || d.url, card: s.card?.url || d.url, large: s.large?.url || d.url, alt: d.alt || '' }
}

const getDb = () => getPayload({ config })

async function loadProjects(locale: Locale) {
  const payload = await getDb()
  const projects = await payload.find({
    collection: 'projects',
    where: { published: { not_equals: false } },
    sort: ['order', '-createdAt'],
    limit: 500,
    depth: 1,
    locale,
  })
  return projects.docs.map((p): ProjectCard => {
    const images = ((p.gallery as unknown[]) || []).map(toImg).filter(Boolean) as Img[]
    return {
      id: p.id,
      slug: p.slug || String(p.id),
      title: p.title,
      category: p.category as Category,
      description: p.description || '',
      client: p.client || undefined,
      location: p.location || undefined,
      year: p.year || undefined,
      featured: Boolean(p.featured),
      cover: toImg(p.cover) || images[0] || null,
      hero: toImg(p.heroPhoto) || toImg(p.cover) || images[0] || null,
      images,
    }
  })
}

async function loadServices(locale: Locale) {
  const payload = await getDb()
  return (await payload.find({ collection: 'services', sort: 'order', limit: 20, depth: 2, locale })).docs
}

async function loadSettings(locale: Locale): Promise<Settings> {
  const payload = await getDb()
  const s = await payload.findGlobal({ slug: 'site-settings', locale })
  return {
    phone: s.phone || '',
    whatsapp: (s.whatsapp || '').replace(/\D/g, ''),
    email: s.email || '',
    instagram: (s.instagram || '').replace(/^@/, ''),
    facebook: (s as { facebook?: string }).facebook || 'https://www.facebook.com/fredielectronics/',
    linkedin: (s as { linkedin?: string }).linkedin || 'https://www.linkedin.com/company/fredielectronics/',
    address: s.address || '',
    hours: s.hours || '',
    founded: s.founded || 1991,
    projectsDone: s.projectsDone || 700,
    brands: s.brands || 30,
  }
}

function makeShell(locale: Locale, settings: Settings, services: Awaited<ReturnType<typeof loadServices>>, projects: ProjectCard[]): Shell {
  const counts = Object.fromEntries(CATS.map((c) => [c, projects.filter((p) => p.category === c).length])) as Record<Category, number>
  return {
    locale,
    settings,
    counts,
    services: services.map((s) => {
      const cat = (s.projectCategory || undefined) as Category | undefined
      // no main photo chosen: a homepage-slideshow project of that category, else its first project
      const fallback = cat ? (projects.find((p) => p.category === cat && p.featured && p.hero) || projects.find((p) => p.category === cat && p.cover))?.hero : null
      const firstPhoto = toImg(s.subsections?.[0]?.photos?.[0])
      return { slug: s.slug, title: s.title, lead: s.lead || '', category: cat, photo: toImg(s.photo) || fallback || firstPhoto || null }
    }),
  }
}

export async function getHomeData(locale: Locale) {
  const payload = await getDb()
  const [projects, brands, home, settings, services] = await Promise.all([
    loadProjects(locale),
    payload.find({ collection: 'brands', sort: 'name', limit: 200, depth: 1 }),
    payload.findGlobal({ slug: 'home-page', depth: 1, locale }),
    loadSettings(locale),
    loadServices(locale),
  ])
  const shell = makeShell(locale, settings, services, projects)
  return {
    ...shell,
    projects,
    // Partner brands on the homepage (institutions stay visible only inside their projects).
    // Ecler first as exclusive partner; brands without a logo are left out here.
    partners: brands.docs.map((b) => ({ name: b.name, logo: toImg(b.logo) })).filter((b) => b.logo)
      .sort((a, b) => Number(b.name === 'Ecler') - Number(a.name === 'Ecler')),
    home: {
      heroLine1: home.heroLine1 || '',
      heroLine2: home.heroLine2 || '',
      heroText: home.heroText || '',
      aboutTitle: home.aboutTitle || '',
      aboutText1: home.aboutText1 || '',
      aboutText2: home.aboutText2 || '',
      aboutPoints: (home.aboutPoints || []).map((x) => x.text),
      aboutPhoto: toImg(home.aboutPhoto),
      servicesIntro: home.servicesIntro || '',
      steps: (home.steps || []).map((x) => x.text),
      projectsTitle: home.projectsTitle || '',
      projectsText: home.projectsText || '',
      favSubtitle: home.favSubtitle || '',
      favText: home.favText || '',
      favStats: (home.favStats || []).map((x) => ({ value: x.value, label: x.label })),
      favLink: home.favLink || 'https://fav.al/',
      favPhoto: toImg(home.favPhoto),
      clientsTitle: home.clientsTitle || '',
      contactTitle: home.contactTitle || '',
      contactText: home.contactText || '',
    },
  }
}

export async function getServicePage(locale: Locale, slug: string) {
  const [projects, settings, services] = await Promise.all([loadProjects(locale), loadSettings(locale), loadServices(locale)])
  const s = services.find((x) => x.slug === slug)
  if (!s) return null
  const shell = makeShell(locale, settings, services, projects)
  // photos that come from our own projects are shown full-bleed; product shots sit on white
  const projectMedia = new Set(projects.flatMap((p) => p.images.map((i) => String(i.id))))
  const cat = (s.projectCategory || undefined) as Category | undefined
  const own = cat ? projects.filter((p) => p.category === cat) : []
  return {
    shell,
    service: {
      slug: s.slug,
      title: s.title,
      lead: s.lead || '',
      intro: (s.intro || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean),
      category: cat,
      // main photo captioned with the (translated) title of the project it comes from
      photo: (() => {
        const ph = shell.services.find((x) => x.slug === slug)?.photo
        if (!ph) return null
        const from = own.find((p) => p.hero?.large === ph.large || p.images.some((i) => i.large === ph.large))
        return { ...ph, alt: from?.title || ph.alt }
      })(),
      side: own.filter((p) => p.cover && p.hero?.large !== shell.services.find((x) => x.slug === slug)?.photo?.large).slice(0, 4).map((p) => ({ ...p.cover!, alt: p.title })),
      // a service without projects shows one product from each section instead of a single photo
      products: cat || toImg(s.photo) ? [] : (s.subsections || []).map((x) => toImg((x.photos as unknown[])?.[0])).filter(Boolean).slice(0, 4) as Img[],
      highlights: (s.highlights || []).map((h) => ({ title: h.title, text: h.text || '' })),
      subsections: (s.subsections || []).map((x) => ({
        title: x.title,
        text: x.text || '',
        items: (x.items || '').split(',').map((i) => i.trim()).filter(Boolean),
        // shot-* uploads are installation photos, not catalogue products
        photos: ((x.photos as unknown[]) || []).map(toImg).filter(Boolean).map((im) => ({ ...im!, product: !projectMedia.has(String(im!.id)) && !/\/shot-/.test(im!.large) })),
      })),
      partners: ((s.partners as unknown[]) || []).filter((b): b is { name: string; logo?: unknown } => !!b && typeof b === 'object')
        .map((b) => ({ name: b.name, logo: toImg(b.logo) })),
    },
    projects: own,
  }
}

export async function getCategoryPage(locale: Locale, cat: Category) {
  const [projects, settings, services] = await Promise.all([loadProjects(locale), loadSettings(locale), loadServices(locale)])
  const shell = makeShell(locale, settings, services, projects)
  return {
    shell,
    category: cat,
    service: shell.services.find((s) => s.category === cat) || null,
    projects: projects.filter((p) => p.category === cat),
  }
}

/** Header/menu/footer data only (used by the "page not found" page). */
export async function getShell(locale: Locale) {
  const [projects, settings, services] = await Promise.all([loadProjects(locale), loadSettings(locale), loadServices(locale)])
  return makeShell(locale, settings, services, projects)
}
