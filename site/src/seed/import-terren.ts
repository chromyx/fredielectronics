/**
 * Imports the projects from Drive "FOTO PUNE NE TERREN FREDI ELECTRONIC" that are not on the site yet.
 * Run with:  npx payload run src/seed/import-terren.ts -- "<path to that folder>"
 * Safe to re-run: a project whose Albanian title already exists is skipped.
 */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const ROOT = process.argv.slice(2).find((a) => fs.existsSync(a))
if (!ROOT) throw new Error('Pass the path to the "FOTO PUNE NE TERREN FREDI ELECTRONIC" folder')
const IMG = /\.(jpe?g|png|webp)$/i
type Cat = 'led' | 'av' | 'sec' | 'power'

const D = {
  av: ['Sistem konference dhe audio: mikrofona për delegatët, altoparlantë dhe pajisje regjistrimi, të instaluara dhe të konfiguruara nga ekipi ynë.',
    'Conference and audio system: delegate microphones, speakers and recording equipment, installed and configured by our team.'],
  led: ['Ekran LED i montuar dhe i kalibruar nga ekipi ynë – imazh i ndritshëm dhe i qartë, i përshtatur për hapësirën.',
    'LED display assembled and calibrated by our team – a bright, sharp picture sized for the space.'],
  sec: ['Instalim sigurie dhe kontrolli aksesi nga ekipi ynë teknik.', 'Security and access-control installation by our technical team.'],
  power: ['Furnizim i pandërprerë me energji me UPS, i instaluar dhe i testuar nga ekipi ynë.', 'Uninterrupted power with a UPS, installed and tested by our team.'],
}

// dirs: one or more source folders (or single files); cover: index of the cover photo in the first folder
const ITEMS: { dirs: string[]; sq: string; en: string; cat: Cat; location?: string; year?: number; cover?: number; max?: number; dSq?: string; dEn?: string }[] = [
  { dirs: ['Bashkia Vlore -Sistem konference'], sq: 'Sistem konference, Bashkia Vlorë', en: 'Conference system, Municipality of Vlorë', cat: 'av', location: 'Vlorë', max: 20 },
  { dirs: ['Sigurime Shoqerore -Salle Konference'], sq: 'Salla e konferencave, Sigurimet Shoqërore', en: 'Conference room, Social Insurance Institute', cat: 'av', location: 'Tiranë', max: 20, cover: 2 },
  { dirs: ['KLGJ', 'KLGJ -Mirembajtje 2026-04-20 at 1.14.10 PM'], sq: 'Sistem konference, Këshilli i Lartë Gjyqësor', en: 'Conference system, High Judicial Council', cat: 'av', location: 'Tiranë', year: 2026, cover: 2,
    dSq: 'Sistem konference, kamera dhe rack audio për sallën e mbledhjeve të Këshillit të Lartë Gjyqësor, si dhe mirëmbajtja e tij e rregullt.',
    dEn: 'Conference system, cameras and audio rack for the High Judicial Council meeting room, plus its regular maintenance.' },
  { dirs: ['Shkolla e muzikes'], sq: 'Sistem audio, Shkolla e Muzikës', en: 'Audio system, Music School', cat: 'av',
    dSq: 'Sistem audio profesional për sallën e koncerteve dhe provave të shkollës së muzikës – altoparlantë në mur dhe subwoofer për zë të pastër në të gjithë sallën.',
    dEn: 'Professional audio for the music school concert and rehearsal hall – wall-mounted speakers and a subwoofer for clean sound across the room.' },
  { dirs: ['Ministria e ekonimise'], sq: 'Salla e mbledhjeve, Ministria e Ekonomisë', en: 'Meeting room, Ministry of Economy', cat: 'av', location: 'Tiranë', cover: 3 },
  { dirs: ['ILD'], sq: 'Salla e konferencave, ILD', en: 'Conference room, ILD', cat: 'av', location: 'Tiranë', cover: 3 },
  { dirs: ['Ekrani Ksamil'], sq: 'Ekran LED i jashtëm, Ksamil', en: 'Outdoor LED screen, Ksamil', cat: 'led', location: 'Ksamil', cover: 2 },
  { dirs: ['Ekrani Led Kisha P3'], sq: 'Ekran LED P3, Kisha', en: 'P3 LED screen, church', cat: 'led', cover: 4 },
  { dirs: ['Green life-tabel p1.8'], sq: 'Ekran LED P1.8, Green Life', en: 'P1.8 LED screen, Green Life', cat: 'led', cover: 2 },
  { dirs: ['Shijaku Group'], sq: 'LED wall, Shijaku Group', en: 'LED wall, Shijaku Group', cat: 'led', cover: 2 },
  { dirs: ['Turku'], sq: 'Ekran LED i jashtëm, Turku', en: 'Outdoor LED screen, Turku', cat: 'led', cover: 4 },
  { dirs: ['foto dyqani reklamava.jpeg'], sq: 'Ekrane LED për dyqan', en: 'LED screens for a shop', cat: 'led' },
  { dirs: ['Spitali heren e pare'], sq: 'Dyer automatike, spital', en: 'Automatic doors, hospital', cat: 'sec', cover: 1,
    dSq: 'Instalim i dyerve automatike rrëshqitëse në hyrjen e spitalit – kalim i sigurt dhe pa kontakt për pacientët dhe stafin.',
    dEn: 'Automatic sliding doors at the hospital entrance – safe, touch-free access for patients and staff.' },
  { dirs: ['kONVIKTI cerrik'], sq: 'Sistem kamerash, Konvikti Cërrik', en: 'CCTV system, Cërrik dormitory', cat: 'sec', location: 'Cërrik' },
  { dirs: ['UPS Ministria e jashtme.jpeg'], sq: 'UPS, Ministria e Jashtme', en: 'UPS, Ministry for Europe and Foreign Affairs', cat: 'power', location: 'Tiranë' },
]

const payload = await getPayload({ config })
const log = (...a: unknown[]) => console.log('[terren]', ...a)

function photos(entry: string, max?: number) {
  const p = path.join(ROOT!, entry)
  if (!fs.statSync(p).isDirectory()) return [p]
  let files = fs.readdirSync(p).filter((f) => IMG.test(f)).sort().map((f) => path.join(p, f))
  if (max && files.length > max) {
    const step = files.length / max
    files = Array.from({ length: max }, (_, i) => files[Math.floor(i * step)])
  }
  return files
}

// New projects go before the existing ones (newest first).
const lowest = (await payload.find({ collection: 'projects', sort: 'order', limit: 1, depth: 0 })).docs[0]?.order ?? 0
let order = lowest - ITEMS.length - 1

for (const it of ITEMS) {
  const exists = await payload.find({ collection: 'projects', where: { title: { equals: it.sq } }, locale: 'sq', limit: 1, depth: 0 })
  if (exists.docs.length) { log('skip (exists):', it.sq); order++; continue }
  let files = it.dirs.flatMap((d, i) => photos(d, i === 0 ? it.max : undefined))
  if (it.cover && files[it.cover]) files = [files[it.cover], ...files.filter((_, i) => i !== it.cover)]
  const ids: number[] = []
  for (const f of files) ids.push((await payload.create({ collection: 'media', data: { alt: it.sq }, filePath: f })).id as number)
  const doc = await payload.create({
    collection: 'projects', locale: 'sq',
    data: { title: it.sq, description: it.dSq || D[it.cat][0], category: it.cat, gallery: ids, cover: ids[0],
      location: it.location, year: it.year, order: order++, published: true },
  })
  await payload.update({ collection: 'projects', id: doc.id, locale: 'en', data: { title: it.en, description: it.dEn || D[it.cat][1] } })
  log(`added: ${it.sq} (${ids.length} photos)`)
}
log('done')
process.exit(0)
