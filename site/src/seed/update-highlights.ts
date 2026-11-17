/** Rewrites the three key points under each service title (Albanian + English). Safe to re-run. */
import { getPayload } from 'payload'
import config from '@payload-config'

// [title sq, text sq, title en, text en]
const H: Record<string, [string, string, string, string][]> = {
  led: [
    ['Montuar nga ne', 'Çdo ekran ndërtohet në punishten tonë, sipas përmasave të projektit', 'Assembled by us', 'Every display is built in our workshop to the size of the project'],
    ['Për brenda dhe jashtë', 'Nga P1.8 për sallat deri te ekranet e mëdha në rrugë', 'Indoor and outdoor', 'From fine P1.8 for halls to large street screens'],
    ['Mbështetje në vend', 'Ekipi ynë teknik i mirëmban ekranet pas instalimit', 'Support on site', 'Our technicians maintain every display after installation'],
  ],
  audio: [
    ['Distributor ekskluziv i Ecler', 'Markë spanjolle, e prodhuar dhe e testuar në Barcelonë', 'Exclusive Ecler distributor', 'A Spanish brand, built and tested in Barcelona'],
    ['Projektim akustik', 'Simulojmë zërin mbi planin e hapësirës para instalimit', 'Acoustic design', 'We simulate the sound on your floor plan before installing'],
    ['5 vjet garanci', 'Për të gjitha produktet Ecler', '5-year warranty', 'On all Ecler products'],
  ],
  conference: [
    ['Me kabllo ose pa kabllo', 'Sistem me kabllo ose me 5G Wi-Fi, sipas sallës', 'Wired or wireless', 'Cabled or 5G Wi-Fi, to suit the room'],
    ['Gjithçka në një sistem', 'Zë, video, votim dhe regjistrim të integruara', 'One integrated system', 'Sound, video, voting and recording together'],
    ['Për institucione', 'Ministri, bashki, gjykata dhe universitete', 'Trusted by institutions', 'Ministries, councils, courts and universities'],
  ],
  security: [
    ['Salla kontrolli', 'Mobilje ergonomike, video wall, KVM dhe UPS', 'Control rooms', 'Ergonomic desks, video walls, KVM and UPS'],
    ['Evakuim sipas EN54', 'Njoftime zanore të ndara sipas zonave', 'EN54 evacuation', 'Voice announcements by zone'],
    ['Një sistem i vetëm', 'Nga kamerat te barrierat, gjithçka e lidhur', 'One connected system', 'From cameras to barriers, all linked'],
  ],
  power: [
    ['Nga 1 kVA deri në MVA', 'Për zyra, salla serverash dhe qendra të dhënash', 'From 1 kVA to MVA', 'For offices, server rooms and data centres'],
    ['Instalim dhe testim', 'Kryhen nga ekipi ynë, në vend', 'Installed and tested', 'By our own team, on site'],
    ['Mirëmbajtje e rregullt', 'Kontrolle periodike dhe ndërrim baterish', 'Regular maintenance', 'Periodic checks and battery replacement'],
  ],
  accessories: [
    ['Që nga 1992', 'Nisëm me komponentë elektronikë dhe i ofrojmë ende', 'Since 1992', 'We started with electronic components and still supply them'],
    ['Për instalues dhe biznese', 'Pjesë dhe aksesorë për çdo instalim', 'For installers and businesses', 'Parts and accessories for every installation'],
    ['Ofertë me WhatsApp', 'Na dërgoni listën dhe ju kthejmë çmimin', 'Quote on WhatsApp', 'Send us your list and we reply with a price'],
  ],
}

const payload = await getPayload({ config })
for (const [slug, rows] of Object.entries(H)) {
  const s = (await payload.find({ collection: 'services', where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0]
  if (!s) continue
  await payload.update({ collection: 'services', id: s.id, locale: 'sq', data: { highlights: rows.map((r) => ({ title: r[0], text: r[1] })) } })
  const fresh = await payload.findByID({ collection: 'services', id: s.id, locale: 'sq', depth: 0 })
  await payload.update({ collection: 'services', id: s.id, locale: 'en', data: { highlights: (fresh.highlights || []).map((h, i) => ({ id: h.id, title: rows[i][2], text: rows[i][3] })) } })
  console.log('[highlights]', slug)
}
process.exit(0)
