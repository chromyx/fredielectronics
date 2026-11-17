/**
 * One-time import of the old WordPress content into Payload.
 * Run with:  npm run seed
 * Safe to re-run: existing projects/clients are left alone.
 */
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'

const ROOT = path.resolve(process.cwd(), '..')
const OLD = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'design-preview', 'projects.js'), 'utf-8').replace(/^window\.PROJECTS = /, '').replace(/;\s*$/, ''),
) as { slug: string; sq: string; en: string; cat: string; text: string; images: string[] }[]

// Homepage slideshow: [project slug fragment, index of its photo to use]
const FEATURED: [string, number][] = [['restaurimi-total-i-kqz', 1], ['bashkiamat', 0], ['ama-video-wall', 0], ['ledwall-p2-5', 1], ['universiteti-i-vlores', 0], ['video-wall-tek-akep', 2]]
const SERVICE_PHOTOS: [string, number][] = [['bashkiamat', 2], ['restaurimi-total-i-kqz', 3], ['kamerave-termike', 1], ['tripod-kalimi', 1], ['led-wall-world-vision', 1], ['ups-60kva', 1]]
const CLIENTS = ['KQZ', 'AKEP', 'AMA', 'Ministria e Arsimit', 'Gjykata e Apelit', 'Bashkia Tiranë', 'Bashkia Durrës', 'Universiteti i Vlorës', 'Politekniku', 'Forcat Detare']

const payload = await getPayload({ config })
const log = (...a: unknown[]) => console.log('[seed]', ...a)

/* ---------- admin login ---------- */
const users = await payload.count({ collection: 'users' })
if (users.totalDocs === 0) {
  const email = 'admin@fredielectronics.com'
  const password = crypto.randomBytes(9).toString('base64url')
  await payload.create({ collection: 'users', data: { email, password } })
  const file = path.join(process.cwd(), 'ADMIN-LOGIN.txt')
  fs.writeFileSync(file, `Admin panel: http://localhost:3000/admin\nEmail: ${email}\nPassword: ${password}\n\nChange the password after first login (Admin users > your account).\n`)
  log('admin user created, login saved to', file)
}

/* ---------- photos ---------- */
const uploaded = new Map<string, number | string>()
async function upload(rel: string, alt: string) {
  const file = path.resolve(ROOT, 'design-preview', rel)
  if (uploaded.has(file)) return uploaded.get(file)!
  if (!fs.existsSync(file)) return null
  const doc = await payload.create({ collection: 'media', data: { alt }, filePath: file })
  uploaded.set(file, doc.id)
  return doc.id
}

/* ---------- projects ---------- */
const existing = await payload.count({ collection: 'projects' })
const projectPhotos: Record<string, (number | string)[]> = {}
if (existing.totalDocs === 0) {
  for (const [i, p] of OLD.entries()) {
    const ids: (number | string)[] = []
    for (const img of p.images) {
      const id = await upload(img, p.sq)
      if (id) ids.push(id)
    }
    projectPhotos[p.slug] = ids
    const feat = FEATURED.find(([f]) => p.slug.includes(f))
    const doc = await payload.create({
      collection: 'projects',
      locale: 'sq',
      data: {
        title: p.sq,
        category: p.cat as 'led' | 'av' | 'sec' | 'power',
        gallery: ids as number[],
        description: p.text,
        order: i + 1,
        featured: Boolean(feat),
        heroPhoto: feat ? (ids[feat[1]] as number) ?? (ids[0] as number) : undefined,
        published: true,
      },
    })
    await payload.update({ collection: 'projects', id: doc.id, locale: 'en', data: { title: p.en } })
    log(`project ${i + 1}/${OLD.length}: ${p.sq} (${ids.length} photos)`)
  }
} else {
  log('projects already exist, skipping project import')
  const all = await payload.find({ collection: 'projects', limit: 500, depth: 0 })
  for (const d of all.docs) projectPhotos[d.slug || ''] = (d.gallery as (number | string)[]) || []
}
const photo = ([frag, i]: [string, number]) => {
  const key = Object.keys(projectPhotos).find((s) => s.includes(frag))
  const ids = key ? projectPhotos[key] : []
  return (ids[i] ?? ids[0]) as number | undefined
}

/* ---------- clients ---------- */
if ((await payload.count({ collection: 'clients' })).totalDocs === 0) {
  for (const [i, name] of CLIENTS.entries()) await payload.create({ collection: 'clients', data: { name, type: 'client', order: i + 1 } })
  log('clients created')
}

/* ---------- contact details ---------- */
await payload.updateGlobal({ slug: 'site-settings', locale: 'sq', data: {
  phone: '+355 69 675 2032', whatsapp: '355696752032', email: 'fredielectronics@gmail.com', instagram: 'fredielectronics',
  address: 'Rr. Kavajës, P.207, Sh.2, Tiranë 1001', founded: 1991, projectsDone: 700, brands: 30,
} })

/* ---------- homepage text ---------- */
const services = [
  ['led', 'Ekrane LED & video wall', 'Panele të montuara nga ne, në çdo madhësi, brenda dhe jashtë.', 'LED displays & video walls', 'Panels we assemble ourselves, any size, indoor and outdoor.'],
  ['av', 'Audio & konferencë', 'Salla mbledhjesh, sisteme konference dhe audio PA.', 'Audio & conference', 'Meeting rooms, conference systems and PA audio.'],
  ['sec', 'Siguri & kontroll aksesi', 'Kamera, kamera termike, alarme, tripode dhe barriera.', 'Security & access control', 'CCTV, thermal cameras, alarms, turnstiles and barriers.'],
  ['sec', 'Sisteme të integruara', 'Parkim, orë pune, video-interfon dhe smart home.', 'Integrated systems', 'Parking, time attendance, video intercom and smart home.'],
  ['av', 'Ndriçim skene', 'Ndriçim LED, mikserë drite dhe efekte speciale.', 'Stage lighting', 'LED lighting, lighting desks and special effects.'],
  ['power', 'Energji & UPS', 'UPS deri në 80 kVA dhe furnizim i pandërprerë.', 'Power & UPS', 'UPS up to 80 kVA and uninterrupted power.'],
] as const
const stepsSq = ['Konceptim', 'Furnizim', 'Instalim', 'Integrim', 'Mirëmbajtje']
const stepsEn = ['Design', 'Supply', 'Installation', 'Integration', 'Maintenance']
const pointsSq = ['Konceptim & projektim', 'Furnizim nga 30+ marka', 'Instalim profesional', 'Mirëmbajtje & suport']
const pointsEn = ['Concept & design', 'Supply from 30+ brands', 'Professional installation', 'Maintenance & support']
const favSq = [['13', 'ekrane LED në 3 kate'], ['10.5M+', 'vizita në vit'], ['12h+', 'ekspozim çdo ditë']]
const favEn = ['LED screens on 3 floors', 'visits per year', 'exposure every day']

const sq = await payload.updateGlobal({ slug: 'home-page', locale: 'sq', data: {
  heroLine1: 'Ju sillni idenë,', heroLine2: 'ne e realizojmë.',
  heroText: 'Ekrane LED, audio-video, sisteme konference, siguri dhe energji – të projektuara, instaluara dhe mirëmbajtura nga ekipi ynë që nga 1991.',
  aboutTitle: 'Integrues sistemesh për institucione dhe biznese',
  aboutText1: 'Fredi Electronics filloi në 1991 si distributor i markave profesionale elektronike në Shqipëri. Sot montojmë vetë panelet tona LED dhe dorëzojmë sisteme të plota audio, video, siguri dhe ndriçimi, gati për punë.',
  aboutText2: 'Punojmë me mbi 30 marka globale dhe qëndrojmë pranë klientëve edhe pas instalimit.',
  aboutPoints: pointsSq.map((text) => ({ text })),
  aboutPhoto: photo(['keshilli-bashkiak-durres', 1]),
  servicesIntro: 'Një partner për gjithë projektin.',
  steps: stepsSq.map((text) => ({ text })),
  services: services.map(([category, title, text], i) => ({ category, title, text, photo: photo(SERVICE_PHOTOS[i]) })),
  projectsTitle: 'Punimet tona',
  projectsText: 'Një përzgjedhje nga mbi 700 instalime në Shqipëri dhe Kosovë – nga sallat e këshillave bashkiake te ekranet LED në sheshe.',
  favSubtitle: 'Rrjeti i reklamimit digjital në TEG, nga Fredi Electronics',
  favText: 'FAV është rrjeti premium i ekraneve LED në TEG, i ndërtuar dhe i operuar nga ne. Me një fushatë të vetme, marka juaj shfaqet në të gjithë rrjetin, në çdo kat.',
  favStats: favSq.map(([value, label]) => ({ value, label })),
  favLink: 'https://fav.al/',
  clientsTitle: 'Institucione që na kanë besuar',
  contactTitle: 'Le të flasim për projektin tuaj',
  contactText: 'Na tregoni për hapësirën dhe idenë tuaj. Ju përgjigjemi brenda një dite pune.',
} })

// English: array rows keep their ids, so only the localized text changes.
await payload.updateGlobal({ slug: 'home-page', locale: 'en', data: {
  heroLine1: 'You bring the idea,', heroLine2: 'we build it.',
  heroText: 'LED displays, audio-video, conference systems, security and power – designed, installed and maintained by our team since 1991.',
  aboutTitle: 'Systems integrator for institutions and businesses',
  aboutText1: 'Fredi Electronics started in 1991 as a distributor of professional electronics brands in Albania. Today we assemble our own LED panels and deliver complete audio, video, security and lighting systems, ready to run.',
  aboutText2: 'We work with more than 30 global brands and stay with our clients long after installation.',
  aboutPoints: (sq.aboutPoints || []).map((r, i) => ({ id: r.id, text: pointsEn[i] })),
  servicesIntro: 'One partner for the whole project.',
  steps: (sq.steps || []).map((r, i) => ({ id: r.id, text: stepsEn[i] })),
  services: (sq.services || []).map((r, i) => ({ ...r, photo: typeof r.photo === 'object' && r.photo ? r.photo.id : r.photo, title: services[i][3], text: services[i][4] })),
  projectsTitle: 'Our work',
  projectsText: 'A selection from more than 700 installations across Albania and Kosovo – from council chambers to LED screens in city squares.',
  favSubtitle: 'The digital advertising network at TEG, by Fredi Electronics',
  favText: 'FAV is the premium LED screen network inside TEG, built and operated by us. One campaign puts your brand on the whole network, on every floor.',
  favStats: (sq.favStats || []).map((r, i) => ({ id: r.id, value: r.value, label: favEn[i] })),
  clientsTitle: 'Institutions that trust us',
  contactTitle: "Let's talk about your project",
  contactText: 'Tell us about your space and your idea. We reply within one working day.',
} })

log('done')
process.exit(0)
