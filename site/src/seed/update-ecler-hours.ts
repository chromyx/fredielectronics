/**
 * 2026-11-17 client feedback: Ecler gets its own section on the Audio page, laptops are removed
 * (Fredi does not sell them) and the opening hours are set. Safe to re-run.
 * Run with:  npx payload run src/seed/update-ecler-hours.ts -- "<ecler-pendant-speaker.png>"
 */
import fs from 'fs'
import { getPayload } from 'payload'
import config from '@payload-config'

const PENDANT = process.argv.slice(2).find((a) => fs.existsSync(a))
const payload = await getPayload({ config })
type Row = { id?: string | null; title: string; text?: string | null; items?: string | null; photos?: unknown }

async function rows(id: number | string) {
  const sq = await payload.findByID({ collection: 'services', id, locale: 'sq', depth: 0 })
  const en = await payload.findByID({ collection: 'services', id, locale: 'en', depth: 0, fallbackLocale: false })
  return { sq: (sq.subsections || []) as Row[], en: (en.subsections || []) as Row[] }
}
// Writes both languages; rows are matched by id so existing translations are kept.
async function save(id: number | string, sq: Row[], enText: Record<number, Partial<Row>>) {
  await payload.update({ collection: 'services', id, locale: 'sq', data: { subsections: sq as never } })
  const fresh = await rows(id)
  await payload.update({
    collection: 'services', id, locale: 'en',
    data: { subsections: fresh.sq.map((r, i) => {
      const old = fresh.en.find((e) => e.id === r.id)
      return { id: r.id, photos: r.photos, title: enText[i]?.title ?? old?.title ?? r.title, text: enText[i]?.text ?? old?.text, items: enText[i]?.items ?? old?.items }
    }) as never },
  })
}
const svc = async (slug: string) => (await payload.find({ collection: 'services', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]

/* Ecler: first section of the Audio page */
const audio = await svc('audio')
const a = await rows(audio.id)
if (!a.sq[0]?.title.startsWith('Ecler')) {
  const photos: number[] = []
  if (PENDANT) photos.push((await payload.create({ collection: 'media', data: { alt: 'Ecler, altoparlant i varur' }, filePath: PENDANT })).id as number)
  photos.push(901, 903, 718) // Ecler wall and EclerPLEX at our stand, Ecler speaker at Zoe Hora
  const ecler: Row = {
    title: 'Ecler – audio për hapësira premium',
    text: 'Si distributor ekskluziv i Ecler në Shqipëri, ofrojmë gjithë gamën e markës spanjolle: altoparlantë të dukshëm dhe të padukshëm, audio shumë-zonash dhe pa kabllo, panele prekëse për kontrollin e AV dhe softuer për menaxhim online. Ecler zgjidhet nga hotele si Meliá, Hilton, NH dhe Marriott.',
    items: 'Altoparlantë të padukshëm, Multi-zone, Wireless, Panele prekëse, Softuer kontrolli online, Muzikë sfondi, Audio jashtë',
    photos,
  }
  await save(audio.id, [ecler, ...a.sq.map((r) => ({ ...r, photos: r.photos }))], {
    0: {
      title: 'Ecler – audio for premium spaces',
      text: 'As Ecler’s exclusive distributor in Albania, we supply the Spanish brand’s full range: visible and invisible speakers, multi-zone and wireless audio, touch panels for AV control and software for online management. Ecler is chosen by hotels such as Meliá, Hilton, NH and Marriott.',
      items: 'Invisible speakers, Multi-zone, Wireless, Touch panels, Online control software, Background music, Outdoor audio',
    },
  })
  console.log('[update] Ecler section added')
}

/* Accessories: no laptops */
const acc = await svc('accessories')
const b = await rows(acc.id)
const it = b.sq.findIndex((r) => r.title.startsWith('IT'))
if (it >= 0) {
  const media = await payload.find({ collection: 'media', where: { alt: { like: 'Laptop' } }, limit: 50, depth: 0 })
  const laptops = new Set(media.docs.map((m) => m.id))
  const sq = b.sq.map((r, i) => i !== it ? r : {
    ...r, text: 'Kompjuterë all-in-one, switch rrjeti dhe ekrane prekëse.', items: 'All-in-one, switch, ekrane prekëse',
    photos: ((r.photos as number[]) || []).filter((p) => !laptops.has(p)),
  })
  await save(acc.id, sq, { [it]: { text: 'All-in-one computers, network switches and touch panels.', items: 'All-in-one PCs, switches, touch panels' } })
  await payload.update({ collection: 'services', id: acc.id, locale: 'sq', data: { intro: 'Fredi Electronics filloi në 1992 me shitjen e qarqeve elektronike, dhe sot ofron ende gjithçka që i duhet një instalimi: kabllo dhe adaptorë, furnizues energjie, komponentë, pjesë altoparlantësh, kompjuterë all-in-one dhe pajisje rrjeti.\n\nNa tregoni çfarë ju duhet dhe ju dërgojmë ofertë.' } })
  await payload.update({ collection: 'services', id: acc.id, locale: 'en', data: { intro: 'Fredi Electronics started in 1992 selling electronic circuits, and still supplies everything an installation needs: cables and adapters, power supplies, components, speaker parts, all-in-one computers and network equipment.\n\nTell us what you need and we will send you an offer.' } })
  console.log('[update] laptops removed')
}

/* Opening hours */
await payload.updateGlobal({ slug: 'site-settings', locale: 'sq', data: { hours: 'E hënë – e premte: 08:00–17:00\nE shtunë: 08:00–14:00\nE diel: pushim' } })
await payload.updateGlobal({ slug: 'site-settings', locale: 'en', data: { hours: 'Monday – Friday: 08:00–17:00\nSaturday: 08:00–14:00\nSunday: closed' } })
console.log('[update] hours set')
process.exit(0)
