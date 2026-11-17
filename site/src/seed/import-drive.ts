/**
 * Imports the new projects from the Google Drive "Projekte" download (everything except
 * "FOTO PUNE NE TERREN") and the TEG photo for the FAV section.
 * Run with:  npx payload run src/seed/import-drive.ts -- "<path to 'Fredi Electronics - Website'>"
 * Safe to re-run: a project whose title already exists is skipped.
 */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const ROOT = process.argv.slice(2).find((a) => fs.existsSync(a))
if (!ROOT) throw new Error('Pass the path to the downloaded "Fredi Electronics - Website" folder')
const P = path.join(ROOT, 'Projekte')
const IMG = /\.(jpe?g|png|webp)$/i

type Item = {
  dir: string
  sq: string; en: string
  descSq: string; descEn: string
  category: 'led' | 'av' | 'sec' | 'power'
  location: string; year: number
  first?: string          // file to use as cover
  extra?: string[]        // files from sub-folders to include
  skip?: RegExp           // files to leave out (social-media graphics)
  max?: number            // cap very large folders
  featured?: string       // landscape photo for the homepage slideshow
}

const ITEMS: Item[] = [
  {
    dir: 'May 2026 - ZOE HORA',
    sq: 'Sistem audio Ecler, Zoe Hora', en: 'Ecler audio system, Zoe Hora',
    descSq: 'Sistem audio i jashtëm dhe i brendshëm me altoparlantë Ecler për resortin Zoe Hora – muzikë e balancuar në tarracë, pishinë dhe restorant, e kontrolluar sipas zonave.',
    descEn: 'Indoor and outdoor Ecler audio for the Zoe Hora resort – balanced background music across the terrace, pool and restaurant, controlled zone by zone.',
    category: 'av', location: 'Himarë', year: 2026,
    first: 'Instagram Post/Zoe Hora 1 .jpg', extra: ['2023-09-28.jpg', 'unnamed.jpg'], max: 24,
  },
  {
    dir: 'May 2026 - Kazino/Fotot',
    sq: 'Ekrane LED, Grand Casino Tirana', en: 'LED screens, Grand Casino Tirana',
    descSq: 'Ekrane LED vertikale në vitrinat e Maritim Plaza Tirana për Grand Casino dhe Rocca – imazh i ndritshëm dhe i qartë edhe në dritë dite.',
    descEn: 'Vertical LED displays in the Maritim Plaza Tirana shop windows for Grand Casino and Rocca – bright, sharp images even in daylight.',
    category: 'led', location: 'Tiranë', year: 2026,
    first: 'WhatsApp Image 2026-05-13 at 18.01.28.jpeg', featured: 'WhatsApp Image 2026-05-13 at 18.01.28.jpeg',
  },
  {
    dir: 'May 2026 - Salle Konference',
    sq: 'Salla e konferencave, Këshilli i Qarkut Dibër', en: 'Conference hall, Dibër County Council',
    descSq: 'Sistem konference dhe audio për sallën e mbledhjeve të Këshillit të Qarkut Dibër – mikrofona për çdo delegat, regjistrim dhe zë i qartë në të gjithë sallën.',
    descEn: 'Conference and audio system for the Dibër County Council meeting hall – a microphone for every delegate, recording and clear sound throughout the room.',
    category: 'av', location: 'Peshkopi', year: 2026,
    skip: /^5\.png$/,
  },
  {
    dir: 'March 2026 - Universiteti Elbassan',
    sq: 'Sistem audio, Universiteti i Elbasanit', en: 'Audio system, University of Elbasan',
    descSq: 'Sistem audio profesional për sallën e aktiviteteve të Universitetit të Elbasanit – altoparlantë të montuar në mur dhe subwoofer për aktivitete, ceremoni dhe evente.',
    descEn: 'Professional audio for the University of Elbasan events hall – wall-mounted speakers and a subwoofer for activities, ceremonies and events.',
    category: 'av', location: 'Elbasan', year: 2026,
    first: 'WhatsApp Image 2026-04-22 at 18.18.22.jpeg', featured: 'WhatsApp Image 2026-04-22 at 18.18.22.jpeg',
  },
  {
    dir: 'March 2026 - Mbledhja QOKSH Plaza Tirana',
    sq: 'Asambleja e KOKSH, Plaza Tirana', en: 'Albanian Olympic Committee assembly, Plaza Tirana',
    descSq: 'Ekran LED, zë dhe ndriçim skene për Asamblenë e Përgjithshme të Komitetit Olimpik Kombëtar Shqiptar në Plaza Tirana.',
    descEn: 'LED screen, sound and stage lighting for the General Assembly of the Albanian National Olympic Committee at Plaza Tirana.',
    category: 'av', location: 'Tiranë', year: 2026,
    first: 'PHOTO-2026-03-27-16-44-48.jpg',
  },
]

const payload = await getPayload({ config })
const log = (...a: unknown[]) => console.log('[drive]', ...a)

async function upload(file: string, alt: string) {
  const doc = await payload.create({ collection: 'media', data: { alt }, filePath: file })
  return doc.id as number
}

// Newest first: put the new projects before the old ones.
const lowest = (await payload.find({ collection: 'projects', sort: 'order', limit: 1, depth: 0 })).docs[0]?.order ?? 1
let order = Math.min(0, lowest - ITEMS.length - 1)

for (const it of ITEMS) {
  const exists = await payload.find({ collection: 'projects', where: { title: { equals: it.sq } }, locale: 'sq', limit: 1, depth: 0 })
  if (exists.docs.length) { log('skip (exists):', it.sq); order++; continue }

  const dir = path.join(P, it.dir)
  let files = fs.readdirSync(dir).filter((f) => IMG.test(f) && !(it.skip && it.skip.test(f))).sort()
  if (it.max && files.length > it.max) {
    const step = files.length / it.max
    files = Array.from({ length: it.max }, (_, i) => files[Math.floor(i * step)])
  }
  const ordered = [it.first, ...(it.extra || []), ...files].filter((f): f is string => Boolean(f))
  const unique = [...new Set(ordered)].filter((f) => fs.existsSync(path.join(dir, f)))

  const ids: number[] = []
  const byFile = new Map<string, number>()
  for (const f of unique) {
    const id = await upload(path.join(dir, f), it.sq)
    ids.push(id); byFile.set(f, id)
  }
  const doc = await payload.create({
    collection: 'projects', locale: 'sq',
    data: {
      title: it.sq, description: it.descSq, category: it.category, gallery: ids, cover: ids[0],
      location: it.location, year: it.year, order: order++, published: true,
      featured: Boolean(it.featured), heroPhoto: it.featured ? byFile.get(it.featured) : undefined,
    },
  })
  await payload.update({ collection: 'projects', id: doc.id, locale: 'en', data: { title: it.en, description: it.descEn } })
  log(`added: ${it.sq} (${ids.length} photos)`)
}

/* ---------- FAV × TEG: aerial photo of TEG behind the sample screen ---------- */
const teg = path.join(ROOT, 'FAV', 'TEG (foto + planimetri)', 'DJI_0352.jpg')
const home = await payload.findGlobal({ slug: 'home-page', depth: 0 })
if (!home.favPhoto && fs.existsSync(teg)) {
  const id = await upload(teg, 'TEG – Tirana East Gate')
  await payload.updateGlobal({ slug: 'home-page', data: { favPhoto: id } })
  log('FAV photo set')
}

log('done')
process.exit(0)
