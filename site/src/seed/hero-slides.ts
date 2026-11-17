/**
 * Homepage slideshow (client request 2026-11-17): drop Elbasan, AKEP, LED wall P2.5 and AMA; add
 * Korçë, Durrës, Shkolla e Magjistraturës, Zoe Hora and Plaza; every slide uses its best wide photo.
 * Also names and publishes the "more" room as the School of Magistrates (client confirmed the project).
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const OFF = [37, 3, 14, 22]
// project id -> slideshow photo (media id), in slideshow order
const ON: [number, number][] = [[39, 726], [2, 499], [62, 811], [15, 692], [79, 891], [1, 485], [38, 319], [20, 617], [34, 718]]

await payload.update({ collection: 'projects', id: 79, locale: 'sq', data: {
  title: 'Salla e konferencave, Shkolla e Magjistraturës', category: 'conf', location: 'Tiranë', published: true,
  description: 'Salla e konferencave e Shkollës së Magjistraturës: sistem konference me mikrofona për çdo vend, monitorë që ngrihen nga tavolina dhe ekrane për prezantime.',
} })
await payload.update({ collection: 'projects', id: 79, locale: 'en', data: {
  title: 'Conference room, School of Magistrates',
  description: 'The School of Magistrates conference room: a conference system with a microphone at every seat, monitors that rise from the table and displays for presentations.',
} })
for (const id of OFF) await payload.update({ collection: 'projects', id, data: { featured: false } })
let order = -40
for (const [id, hero] of ON) await payload.update({ collection: 'projects', id, data: { featured: true, heroPhoto: hero, order: order++ } })
console.log('[slides]', ON.map((x) => x[0]).join(','))
process.exit(0)
