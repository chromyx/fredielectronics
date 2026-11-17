/** Interpretation section: the booth photos from the Vlorë university hall come first, then two headsets. */
import { getPayload } from 'payload'
import config from '@payload-config'
const payload = await getPayload({ config })
const s = (await payload.find({ collection: 'services', where: { slug: { equals: 'conference' } }, limit: 1, depth: 0, locale: 'sq' })).docs[0]
const subs = (s.subsections || []).map((x) => ({ ...x, photos: [...((x.photos as number[]) || [])] }))
const i = subs.findIndex((x) => x.title.startsWith('Interpretim'))
if (i >= 0 && !subs[i].photos.includes(630)) {
  subs[i].photos = [630, 629, ...subs[i].photos.slice(0, 2)]
  await payload.update({ collection: 'services', id: s.id, locale: 'sq', data: { subsections: subs } })
}
console.log('[interp] done', i)
process.exit(0)
