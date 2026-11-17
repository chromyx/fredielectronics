/**
 * The Tirana International Fair 2025 stand and the Match Maker Albania 2026 stand are the same stand:
 * merge #80 into #63 (near-duplicate photos dropped, visitor-free photos first) and delete #80.
 * Photos stay in Media. Safe to re-run.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const KEEP = 63, DROP = 80
const ORDER = [821, 822, 820, 823, 900, 901, 902, 903, 904, 1124, 1127, 1128, 1129, 1130, 1131, 1132]
await payload.update({
  collection: 'projects', id: KEEP, locale: 'sq',
  data: {
    title: 'Stenda jonë, Panairi i Tiranës 2025 dhe Match Maker Albania 2026',
    gallery: ORDER, cover: ORDER[0], location: 'Tiranë', year: 2025,
    description: 'Stenda e Fredi Electronics në Panairin Ndërkombëtar të Tiranës 2025 dhe në Match Maker Albania 2026: ekrane LED poster, ekran interaktiv, sistemi i konferencës pa kabllo dhe altoparlantët Ecler, të montuara dhe të drejtuara nga ekipi ynë.',
  },
})
await payload.update({
  collection: 'projects', id: KEEP, locale: 'en',
  data: {
    title: 'Our stand, Tirana International Fair 2025 and Match Maker Albania 2026',
    description: 'The Fredi Electronics stand at Tirana International Fair 2025 and Match Maker Albania 2026: LED posters, an interactive display, the wireless conference system and Ecler speakers, set up and run by our team.',
  },
})
const drop = await payload.find({ collection: 'projects', where: { id: { equals: DROP } }, limit: 1, depth: 0 })
if (drop.docs.length) await payload.delete({ collection: 'projects', id: DROP })
console.log('[merge] kept', KEEP, 'with', ORDER.length, 'photos; removed', drop.docs.length ? DROP : 'nothing')
process.exit(0)
