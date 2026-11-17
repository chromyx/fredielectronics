/**
 * Adds the Fredi stand at Tirana International Fair 2025 (photos found only on WordPress)
 * from "Te-gjitha-fotot/5 - Panairi ...". Safe to re-run: skipped if the project exists.
 * Run with:  npx payload run src/seed/add-fair-2025.ts -- "<that folder>"
 */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const DIR = process.argv.slice(2).find((a) => fs.existsSync(a))
if (!DIR) throw new Error('Pass the fair photo folder')
const SQ = 'Stenda jonë, Panairi Ndërkombëtar i Tiranës 2025'
const payload = await getPayload({ config })
const exists = await payload.find({ collection: 'projects', where: { title: { equals: SQ } }, locale: 'sq', limit: 1, depth: 0 })
if (exists.docs.length) { console.log('[fair] exists'); process.exit(0) }
const files = fs.readdirSync(DIR).sort()
// stand photos without visitors first, so the cover shows the stand itself
const ORDER = [8, 9, 3, 6, 7, 4, 1, 2, 5]
const ids: number[] = []
for (const n of ORDER) ids.push((await payload.create({ collection: 'media', data: { alt: SQ }, filePath: path.join(DIR, files[n - 1]) })).id as number)
const mm = (await payload.find({ collection: 'projects', where: { title: { equals: 'Stenda jonë, Match Maker Albania 2026' } }, locale: 'sq', limit: 1, depth: 0 })).docs[0]
const doc = await payload.create({
  collection: 'projects', locale: 'sq',
  data: {
    title: SQ, category: 'led', gallery: ids, cover: ids[0], location: 'Tiranë', year: 2025, published: true,
    order: typeof mm?.order === 'number' ? mm.order + 0.5 : undefined,
    description: 'Stenda e Fredi Electronics në Panairin Ndërkombëtar të Tiranës 2025: ekrane LED poster, ekran interaktiv, sistemi i konferencës pa kabllo dhe altoparlantët Ecler, të montuara dhe të drejtuara nga ekipi ynë.',
  },
})
await payload.update({ collection: 'projects', id: doc.id, locale: 'en', data: {
  title: 'Our stand, Tirana International Fair 2025',
  description: 'The Fredi Electronics stand at Tirana International Fair 2025: LED posters, an interactive display, the wireless conference system and Ecler speakers, set up and run by our team.',
} })
console.log('[fair] added', ids.length, 'photos, id', doc.id)
process.exit(0)
