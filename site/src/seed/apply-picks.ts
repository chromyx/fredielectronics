/**
 * Applies a hand-picked photo selection (finished work only) to the projects.
 * Run with:  npx payload run src/seed/apply-picks.ts -- <plan.json> <index.json>
 *   index.json: { "<photo number>": "<absolute file path>" }
 *   plan.json:  replace { projectId: [photo numbers] }, category { projectId: cat },
 *               unpublish [projectIds], create [{ ids, cat, sq, en, location?, year?, draft? }]
 * Replaced galleries keep their old uploads in Media (nothing is deleted).
 */
import fs from 'fs'
import { getPayload } from 'payload'
import config from '@payload-config'

const [planFile, indexFile] = process.argv.slice(2).filter((a) => fs.existsSync(a))
if (!planFile || !indexFile) throw new Error('Pass <plan.json> <index.json>')
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'))
const index: Record<string, string> = JSON.parse(fs.readFileSync(indexFile, 'utf8'))
type Cat = 'led' | 'av' | 'sec' | 'power'

const D: Record<Cat, [string, string]> = {
  av: ['Sistem audio-vizual dhe konference, i instaluar dhe i konfiguruar nga ekipi ynë.',
    'Audio-visual and conference system, installed and configured by our team.'],
  led: ['Ekran LED i montuar dhe i kalibruar nga ekipi ynë – imazh i ndritshëm dhe i qartë, i përshtatur për hapësirën.',
    'LED display assembled and calibrated by our team – a bright, sharp picture sized for the space.'],
  sec: ['Instalim sigurie: kamera, kontroll aksesi dhe alarm, nga ekipi ynë teknik.',
    'Security installation: cameras, access control and alarms, by our technical team.'],
  power: ['Instalim elektrik dhe furnizim i sigurt me energji, i testuar nga ekipi ynë.',
    'Electrical installation and reliable power supply, tested by our team.'],
}

const payload = await getPayload({ config })
const log = (...a: unknown[]) => console.log('[picks]', ...a)

async function upload(nums: number[], alt: string) {
  const ids: number[] = []
  for (const n of nums) {
    const f = index[String(n)]
    if (!f || !fs.existsSync(f)) { log('missing photo', n); continue }
    ids.push((await payload.create({ collection: 'media', data: { alt }, filePath: f })).id as number)
  }
  return ids
}

for (const [id, nums] of Object.entries(plan.replace as Record<string, number[]>)) {
  const p = await payload.findByID({ collection: 'projects', id, locale: 'sq', depth: 0 })
  const ids = await upload(nums, p.title as string)
  const data: Record<string, unknown> = { gallery: ids, cover: ids[0] }
  if (plan.category?.[id]) data.category = plan.category[id]
  await payload.update({ collection: 'projects', id, data })
  log(`replaced: ${p.title} (${ids.length})`)
}

for (const id of plan.unpublish || []) {
  await payload.update({ collection: 'projects', id, data: { published: false } })
  log('hidden:', id)
}

const last = (await payload.find({ collection: 'projects', sort: '-order', limit: 1, depth: 0 })).docs[0]?.order ?? 0
let order = last + 1
for (const it of plan.create || []) {
  const exists = await payload.find({ collection: 'projects', where: { title: { equals: it.sq } }, locale: 'sq', limit: 1, depth: 0 })
  if (exists.docs.length) { log('skip (exists):', it.sq); continue }
  const ids = await upload(it.ids, it.sq)
  const cat = it.cat as Cat
  const doc = await payload.create({
    collection: 'projects', locale: 'sq',
    data: { title: it.sq, description: D[cat][0], category: cat, gallery: ids, cover: ids[0],
      location: it.location, year: it.year, order: order++, published: !it.draft },
  })
  await payload.update({ collection: 'projects', id: doc.id, locale: 'en', data: { title: it.en, description: D[cat][1] } })
  log(`added: ${it.sq} (${ids.length})${it.draft ? ' [hidden]' : ''}`)
}
log('done')
process.exit(0)
