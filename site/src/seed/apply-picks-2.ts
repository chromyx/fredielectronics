/**
 * One-off follow-up to apply-picks.ts (2026-11-16): merges three projects that were added twice,
 * puts the Durrës photos on the right projects, trims the projects that were not in the
 * "socal" folder to finished-work photos, and adds the converted iPhone photos.
 * Run with:  npx payload run src/seed/apply-picks-2.ts -- <scratch folder>
 */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const S = process.argv.slice(2).find((a) => fs.existsSync(a))
if (!S) throw new Error('Pass the scratch folder')
const socal: Record<string, string> = JSON.parse(fs.readFileSync(path.join(S, 'sheets', 'index.json'), 'utf8'))
const site: Record<string, { media: number }> = JSON.parse(fs.readFileSync(path.join(S, 'sheets2', 'index.json'), 'utf8'))
const m = (n: number) => site[String(n)].media

const payload = await getPayload({ config })
const log = (...a: unknown[]) => console.log('[picks2]', ...a)
const galleryOf = async (id: number | string) =>
  ((await payload.findByID({ collection: 'projects', id, depth: 0 })).gallery as number[]) || []
const setGallery = (id: number | string, ids: number[], extra: Record<string, unknown> = {}) =>
  payload.update({ collection: 'projects', id, data: { gallery: ids, cover: ids[0], ...extra } })
const byTitle = async (t: string) =>
  (await payload.find({ collection: 'projects', where: { title: { equals: t } }, locale: 'sq', limit: 1, depth: 0 })).docs[0]
const upload = async (files: string[], alt: string) => {
  const ids: number[] = []
  for (const f of files) ids.push((await payload.create({ collection: 'media', data: { alt }, filePath: f })).id as number)
  return ids
}
// A project added as new turned out to be an existing one: give its photos to the existing project.
async function merge(newTitle: string, intoId: number, extra: Record<string, unknown> = {}) {
  const dup = await byTitle(newTitle)
  if (!dup) return log('already merged:', newTitle)
  await setGallery(intoId, dup.gallery as number[], extra)
  await payload.delete({ collection: 'projects', id: dup.id })
  log(`merged "${newTitle}" into #${intoId}`)
}

// Durrës: the council hall with the big LED screen is #15; #26 is the meeting-room LED wall.
const hall = await galleryOf(26)
if (!hall.includes(207)) { // 207 is one of #26's own photos: once it is back, this step has already run
  await setGallery(15, hall)
  const wall = await upload([568, 571, 570, 572].map((n) => socal[n]), 'Bashkia Durrës')
  await setGallery(26, [wall[0], 207, wall[1], wall[2], wall[3], 213])
  log('fixed the two Durrës projects')
}

await merge('Salla e Këshillit Bashkiak, Burrel', 4)
await merge('Kamera, rrjet dhe alarm zjarri, call center', 31, { category: 'sec' })
await merge('Sistem konference, Universiteti i Sporteve', 10)
await payload.update({ collection: 'projects', id: 10, locale: 'sq', data: { title: 'Sistem konference, Universiteti i Sporteve', location: 'Tiranë' } })
await payload.update({ collection: 'projects', id: 10, locale: 'en', data: { title: 'Conference system, Sports University of Tirana' } })

// Projects that were not in the folder: keep only finished-work photos.
await setGallery(11, [m(10)])
await setGallery(16, [m(20), m(17), m(22)])
await setGallery(30, [m(24), m(26), m(27)])
await payload.update({ collection: 'projects', id: 48, data: { published: false } }) // Shijaku: only build photos so far
log('trimmed #11 #16 #30, hid #48')

// Match Maker stand: the iPhone (HEIC) photos, converted to JPG.
const mm = await byTitle('Stenda jonë, Match Maker Albania 2026')
if (mm && (mm.gallery as number[]).length === 4) {
  const extra = await upload(['IMG_6193', 'IMG_6181 (1)', 'IMG_6201', 'IMG_6208', 'IMG_6202'].map((f) => path.join(S, 'heic', f + '.jpg')), mm.title as string)
  await setGallery(mm.id, [...(mm.gallery as number[]), ...extra])
  log('added 5 photos to the Match Maker stand')
}

// Unknown room from the "more" folder: named after its folder until the real name is known.
const more = await byTitle('Salla e konferencave me monitorë të fshehur')
if (more) {
  await payload.update({ collection: 'projects', id: more.id, locale: 'sq', data: { title: 'more' } })
  await payload.update({ collection: 'projects', id: more.id, locale: 'en', data: { title: 'more' } })
  log('renamed the unknown room to "more", id', more.id)
}
log('done')
process.exit(0)
