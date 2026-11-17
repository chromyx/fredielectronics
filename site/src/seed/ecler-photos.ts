/**
 * Ecler section: the lounge, restaurant and gym photos (from the "unknown" folder, per the client)
 * plus the Ecler pendant speaker. Files named shot-* are shown full-bleed, not as product shots.
 * Run with:  npx payload run src/seed/ecler-photos.ts -- "<folder with shot-ecler-*.png>"
 */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const DIR = process.argv.slice(2).find((a) => fs.existsSync(a))!
const payload = await getPayload({ config })
const s = (await payload.find({ collection: 'services', where: { slug: { equals: 'audio' } }, limit: 1, depth: 1, locale: 'sq' })).docs[0]
const subs = (s.subsections || []).map((x) => ({ ...x, photos: ((x.photos as { id: number; alt?: string }[]) || []) }))
if (!subs[0].title.startsWith('Ecler')) throw new Error('Ecler section not first')
const pendant = subs[0].photos.find((p) => p.alt?.includes('varur'))
const alts: Record<string, string> = { 'shot-ecler-lounge.png': 'Altoparlant Ecler në një lounge', 'shot-ecler-restaurant.png': 'Audio Ecler në restorant', 'shot-ecler-gym.png': 'Audio Ecler në palestër' }
const ids: number[] = []
for (const f of Object.keys(alts)) ids.push((await payload.create({ collection: 'media', data: { alt: alts[f] }, filePath: path.join(DIR, f) })).id as number)
if (pendant) ids.push(pendant.id)
const data = subs.map((x, i) => ({ ...x, photos: i === 0 ? ids : x.photos.map((p) => p.id) }))
await payload.update({ collection: 'services', id: s.id, locale: 'sq', data: { subsections: data as never } })
console.log('[ecler] photos', ids.join(','))
process.exit(0)
