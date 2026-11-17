/**
 * Fills the six service pages, their partner brands and product photos, and splits
 * "Audio & Konferencë" projects into Audio and Konferenca.
 * Texts come from the 2026 company catalogue and the old WordPress site; product photos
 * from the old shop (backup/data/products.json).
 * Run with:  npx payload run src/seed/services.ts -- "<folder with brand logos>"
 * Safe to re-run: services and brands that already exist are left alone.
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '@payload-config'

const LOGOS = process.argv.slice(2).find((a) => fs.existsSync(a))
if (!LOGOS) throw new Error('Pass the folder with the brand logos')
const BACKUP = path.resolve(process.cwd(), '..', 'backup')
const payload = await getPayload({ config })
const log = (...a: unknown[]) => console.log('[services]', ...a)

/* ---------- brands: logo file number in the logo folder (sorted by name) ---------- */
const logoFiles = fs.readdirSync(LOGOS).sort()
const BRANDS: [string, number | null][] = [
  ['Ecler', 14], ['DSPPA', 26], ['JTS', 13], ['FBT', 8], ['Proel', 35], ['Yamaha', 22], ['Wharfedale Pro', 21],
  ['Master Audio', 6], ['TOA', 19], ['MUXWAVE', 36], ['Sharp', 38], ['ViewSonic', 20], ['Epson', 7], ['Riotouch', 15],
  ['Canon', 34], ['Logitech', null], ['Hikvision', 12], ['Dahua', 24], ['ArmaKontrol', 18], ['Gesab', 27],
  ['Tescom', 41], ['Inform', 30], ['Aytemiz Makelsan', null], ['Lenovo', 31], ['HP', 11],
]
const brandId: Record<string, number> = {}
for (const [name, n] of BRANDS) {
  const found = (await payload.find({ collection: 'brands', where: { name: { equals: name } }, limit: 1, depth: 0 })).docs[0]
  if (found) { brandId[name] = found.id as number; continue }
  let logo: number | undefined
  if (n) logo = (await payload.create({ collection: 'media', data: { alt: name }, filePath: path.join(LOGOS, logoFiles[n - 1]) })).id as number
  brandId[name] = (await payload.create({ collection: 'brands', data: { name, logo } })).id as number
  log('brand', name)
}

/* ---------- product photos from the old shop, by WordPress category slug ---------- */
type WpProduct = { name: string; images?: { src: string }[]; categories: { slug: string }[] }
const products: WpProduct[] = JSON.parse(fs.readFileSync(path.join(BACKUP, 'data', 'products.json'), 'utf8'))
const localImg = (url: string) => {
  const rel = url.split('/wp-content/uploads/')[1]
  if (!rel) return null
  const f = path.join(BACKUP, 'images', rel)
  if (fs.existsSync(f)) return f
  const plain = f.replace(/-scaled(\.\w+)$/, '$1')
  return fs.existsSync(plain) ? plain : null
}
const used = new Set<string>()
// Small perceptual hash, so the same photo (or a near copy) is never shown twice in a row of photos.
async function dhash(f: string) {
  const { data } = await sharp(f).flatten({ background: '#fff' }).greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true })
  let h = ''
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) h += data[y * 9 + x] > data[y * 9 + x + 1] ? '1' : '0'
  return h
}
const near = (a: string, b: string) => [...a].filter((c, i) => c !== b[i]).length <= 10
async function photosFor(slugs: string[], projectIds: number[] = [], n = 4) {
  const ids: number[] = []
  // our own project covers first (LED products in the old shop are mostly banners)
  for (const pid of projectIds) {
    const p = await payload.findByID({ collection: 'projects', id: pid, depth: 0 })
    const c = (p.cover || (p.gallery as number[])?.[0]) as number | undefined
    if (c) ids.push(c)
  }
  const hashes: string[] = []
  for (const slug of slugs) {
    for (const p of products) {
      if (ids.length >= n) break
      if (!p.categories.some((c) => c.slug === slug) || used.has(p.name)) continue
      const f = p.images?.[0] && localImg(p.images[0].src)
      if (!f) continue
      const meta = await sharp(f).metadata()
      const ratio = (meta.width || 1) / (meta.height || 1)
      if (ratio > 1.9 || ratio < 0.5) continue // banners and strips
      const h = await dhash(f)
      if (hashes.some((x) => near(x, h))) continue
      hashes.push(h); used.add(p.name)
      ids.push((await payload.create({ collection: 'media', data: { alt: p.name.replace(/&#0?38;|&amp;/g, '&') }, filePath: f })).id as number)
    }
  }
  return ids
}

/* ---------- content ---------- */
type Sub = { sq: string; en: string; tSq: string; tEn: string; iSq: string; iEn: string; cats: string[]; proj?: number[] }
type Svc = {
  slug: string; order: number; cat?: string; brands: string[]
  title: [string, string]; lead: [string, string]; intro: [string, string]
  highlights: [string, string, string, string][]
  subs: Sub[]
}
const S: Svc[] = [
  {
    slug: 'led', order: 1, cat: 'led', brands: ['MUXWAVE', 'Sharp', 'ViewSonic', 'Epson'],
    title: ['Ekrane LED & video', 'LED displays & video'],
    lead: ['Ekrane LED të montuara nga ne, për brenda dhe jashtë.', 'LED displays assembled in-house, for indoor and outdoor use.'],
    intro: [
      'Me mbi 10 vjet përvojë në ekranet LED, Fredi Electronics ndërton zgjidhje të përshtatura për çdo hapësirë: fasada, dyqane, salla, evente dhe hapësira publike. Modulet dhe kabinetet zgjidhen sipas funksionit, distancës së shikimit dhe efektit që kërkoni.\n\nEkranet montohen në punishten tonë, instalohen nga ekipi ynë dhe mirëmbahen në vend. Si partner inxhinierik i MUXWAVE në Shqipëri, sjellim edhe ekranet LED transparente holografike.',
      'With more than 10 years in LED, Fredi Electronics builds displays sized for each space: façades, shops, halls, events and public spaces. Modules and cabinets are chosen for the purpose, the viewing distance and the effect you want.\n\nDisplays are assembled in our workshop, installed by our team and maintained on site. As MUXWAVE’s engineering partner in Albania, we also bring holographic transparent LED.',
    ],
    highlights: [
      ['Të montuara nga ne', 'Panele sipas përmasave të projektit', 'Assembled by us', 'Panels built to the project’s size'],
      ['Brenda & jashtë', 'Nga P1.8 për salla deri te ekranet e rrugës', 'Indoor & outdoor', 'From P1.8 for halls to street screens'],
      ['Mbështetje lokale', 'Ekip teknik në Shqipëri për mirëmbajtje', 'Local support', 'A technical team in Albania for maintenance'],
    ],
    subs: [
      { sq: 'Ekrane LED brenda & jashtë', en: 'Indoor & outdoor LED displays', tSq: 'Ekrane për salla, fasada, stadiume dhe reklamë rrugore, me ndriçim dhe hap pikseli sipas vendit.', tEn: 'Screens for halls, façades, arenas and street advertising, with the brightness and pixel pitch the location needs.', iSq: 'P1.8 – P10, kabinete, module, kontrollues', iEn: 'P1.8 – P10, cabinets, modules, controllers', cats: [], proj: [1, 49, 14, 47] },
      { sq: 'LED poster & tabela', en: 'LED posters & signs', tSq: 'Postera LED për vitrina, kryqe farmacie dhe tabela çmimesh për pikat e karburantit.', tEn: 'LED posters for shop windows, pharmacy crosses and fuel price signs.', iSq: 'Poster, kryqe LED, tabela çmimesh, tabela këmbimi', iEn: 'Posters, LED crosses, price signs, exchange-rate boards', cats: [], proj: [55, 28, 66, 69] },
      { sq: 'LED kreative & transparente', en: 'Creative & transparent LED', tSq: 'Forma të veçanta, dysheme LED interaktive dhe ekrane transparente holografike MUXWAVE.', tEn: 'Custom shapes, interactive LED floors and MUXWAVE holographic transparent screens.', iSq: 'Forma sipas porosisë, dysheme LED, LED transparente', iEn: 'Custom shapes, LED floors, transparent LED', cats: [], proj: [63, 75] },
      { sq: 'Video wall & projektorë', en: 'Video walls & projectors', tSq: 'Video wall për salla kontrolli dhe zyra, projektorë për salla mësimi dhe prezantime.', tEn: 'Video walls for control rooms and offices, projectors for classrooms and presentations.', iSq: 'Video wall, projektorë, kontrollues, aksesorë', iEn: 'Video walls, projectors, controllers, accessories', cats: ['video-projector'], proj: [3, 22] },
    ],
  },
  {
    slug: 'audio', order: 2, cat: 'av', brands: ['Ecler', 'DSPPA', 'FBT', 'Proel', 'Yamaha', 'Wharfedale Pro', 'Master Audio', 'JTS', 'TOA'],
    title: ['Sisteme audio', 'Audio systems'],
    lead: ['Zë i pastër për hotele, restorante, salla dhe skena.', 'Clear sound for hotels, restaurants, halls and stages.'],
    intro: [
      'Fredi Electronics ofron sisteme audio për bare, restorante, hotele, salla konferencash, auditore, institucione dhe hapësira shumëfunksionale, si edhe për skena, evente dhe koncerte.\n\nPërveç zgjedhjes dhe instalimit të pajisjeve, bëjmë projektim dhe simulim akustik sipas planit të hapësirës, që zëri të shpërndahet njësoj kudo. Jemi distributori ekskluziv i Ecler në Shqipëri, markë spanjolle e pranishme në mbi 80 vende.',
      'Fredi Electronics designs audio for bars, restaurants, hotels, conference halls, auditoriums, institutions and multi-purpose spaces, as well as stages, events and concerts.\n\nBeyond choosing and installing the equipment, we do acoustic design and simulation from the floor plan, so the sound is even everywhere. We are the exclusive distributor in Albania of Ecler, a Spanish brand present in more than 80 countries.',
    ],
    highlights: [
      ['Distributor ekskluziv i Ecler', 'Prodhuar dhe testuar në Barcelonë', 'Exclusive Ecler distributor', 'Made and tested in Barcelona'],
      ['Projektim akustik', 'Simulim sipas planit të hapësirës', 'Acoustic design', 'Simulation from the floor plan'],
      ['5 vjet garanci', 'Për produktet Ecler', '5-year warranty', 'On Ecler products'],
    ],
    subs: [
      { sq: 'Altoparlantë instalimi', en: 'Installation speakers', tSq: 'Altoparlantë në tavan, në mur, horn dhe kolona, për muzikë sfondi dhe njoftime në çdo zonë.', tEn: 'In-ceiling, wall, horn and column speakers for background music and announcements in every zone.', iSq: 'Në tavan, në mur, horn, kolona, të padukshëm', iEn: 'In-ceiling, wall, horn, column, invisible', cats: ['ceiling-speaker', 'wall-speaker', 'installation-speakers', 'horn-speaker'] },
      { sq: 'Audio profesionale & line array', en: 'Professional audio & line arrays', tSq: 'Altoparlantë aktivë dhe pasivë, subwoofer dhe line array për skena, evente dhe salla të mëdha.', tEn: 'Active and passive speakers, subwoofers and line arrays for stages, events and large halls.', iSq: 'Aktivë, pasivë, subwoofer, line array, monitorë', iEn: 'Active, passive, subwoofers, line arrays, monitors', cats: ['line-arrays', 'active-speakers', 'active-subwoofers', 'passive-speaker'] },
      { sq: 'Amplifikatorë & procesorë', en: 'Amplifiers & processors', tSq: 'Amplifikatorë komercialë dhe profesionalë, procesorë sinjali dhe kontroll shumë-zonash.', tEn: 'Commercial and professional amplifiers, signal processors and multi-zone control.', iSq: 'Komercialë, profesionalë, DSP, multi-zone', iEn: 'Commercial, professional, DSP, multi-zone', cats: ['amplifiers', 'signal-processors', 'dynamic-processors'] },
      { sq: 'Mikserë & mikrofona', en: 'Mixers & microphones', tSq: 'Mikserë analogë dhe dixhitalë, mikrofona me kabllo dhe pa kabllo për zë, instrumente dhe instalime.', tEn: 'Analogue and digital mixers, wired and wireless microphones for voice, instruments and installations.', iSq: 'Mikserë, mikrofona me/pa kabllo, kufje, ndërfaqe audio', iEn: 'Mixers, wired/wireless mics, headphones, audio interfaces', cats: ['mixers', 'wireless-transmission-system', 'wired-vocal-microphone', 'instrument-microphones'] },
      { sq: 'Ndriçim skene & efekte', en: 'Stage lighting & effects', tSq: 'Ndriçim LED PAR, koka lëvizëse, mikserë ndriçimi dhe makina tymi për skena dhe evente.', tEn: 'LED PAR lights, moving heads, lighting desks and smoke machines for stages and events.', iSq: 'PAR LED, koka lëvizëse, mikserë DMX, tym/borë', iEn: 'LED PAR, moving heads, DMX desks, smoke/snow', cats: ['par-led-lighting', 'lighting-robot', 'lighting-mixer', 'smoke-snow-machines'] },
    ],
  },
  {
    slug: 'conference', order: 3, cat: 'conf', brands: ['DSPPA', 'JTS', 'Riotouch', 'Epson', 'ViewSonic', 'Logitech', 'Canon'],
    title: ['Sisteme konference', 'Conference systems'],
    lead: ['Salla mbledhjesh, interpretim simultan dhe takime online.', 'Meeting rooms, simultaneous interpretation and online meetings.'],
    intro: [
      'Teknologji për salla mbledhjesh, këshilla bashkiakë, auditore dhe hapësira shumëfunksionale: mikrofona delegatësh, votim, interpretim simultan, kamera që ndjekin folësin dhe ekrane interaktive.\n\nÇdo sallë projektohet si një sistem i vetëm, me kabllo ose pa kabllo me teknologji 5G Wi-Fi, që takimet të menaxhohen lehtë dhe zëri të dëgjohet qartë.',
      'Technology for meeting rooms, municipal councils, auditoriums and multi-purpose spaces: delegate microphones, voting, simultaneous interpretation, cameras that follow the speaker and interactive displays.\n\nEach room is designed as one system, wired or wireless with 5G Wi-Fi, so meetings are easy to run and every voice is heard clearly.',
    ],
    highlights: [
      ['Me kabllo ose pa kabllo', 'Sipas sallës, me 5G Wi-Fi ose kabllo', 'Wired or wireless', 'Per room, with 5G Wi-Fi or cabling'],
      ['Integrim i plotë', 'Zë, video, votim dhe regjistrim', 'Fully integrated', 'Voice, video, voting and recording'],
      ['Mbi 25 salla', 'Ministri, bashki, gjykata, universitete', '25+ rooms', 'Ministries, councils, courts, universities'],
    ],
    subs: [
      { sq: 'Sisteme konference & votimi', en: 'Conference & voting systems', tSq: 'Mikrofona për delegatët dhe kryesuesin, me votim elektronik dhe menaxhim të seancës.', tEn: 'Delegate and chair microphones with electronic voting and session management.', iSq: 'Mikrofona delegati, kryesues, votim, njësi qendrore', iEn: 'Delegate and chair units, voting, central units', cats: [], proj: [42, 41, 62, 19] },
      { sq: 'Interpretim simultan', en: 'Simultaneous interpretation', tSq: 'Kabina, marrës dhe kufje për seanca shumëgjuhëshe.', tEn: 'Booths, receivers and headsets for multilingual sessions.', iSq: 'Kabina, marrës, kufje, transmetues', iEn: 'Booths, receivers, headsets, transmitters', cats: ['headphones'] },
      { sq: 'Kamera PTZ 4K & video', en: '4K PTZ cameras & video', tSq: 'Kamera inteligjente që ndjekin automatikisht folësin aktiv, për transmetim dhe takime online.', tEn: 'Smart cameras that automatically follow the active speaker, for streaming and online meetings.', iSq: 'PTZ 4K, transmetim, regjistrim, podcast', iEn: '4K PTZ, streaming, recording, podcast', cats: ['video-conference', 'broadcast-and-streaming'] },
      { sq: 'Ekrane interaktive & podiume', en: 'Interactive displays & podiums', tSq: 'Smartboard për prezantime dhe mësim, podiume dixhitale me ekran prekës dhe sisteme pa letër.', tEn: 'Smartboards for presentations and teaching, digital podiums with touchscreens and paperless systems.', iSq: 'Smartboard, podiume, paperless, monitorë të fshehur', iEn: 'Smartboards, podiums, paperless, pop-up monitors', cats: ['monitors', 'integrated'] },
    ],
  },
  {
    slug: 'security', order: 4, cat: 'sec', brands: ['Hikvision', 'Dahua', 'ArmaKontrol', 'Gesab', 'TOA'],
    title: ['Siguri & akses', 'Security & access'],
    lead: ['Kamera, kontroll aksesi, alarm dhe salla kontrolli.', 'CCTV, access control, alarms and control rooms.'],
    intro: [
      'Fredi Electronics instalon sisteme sigurie për institucione, biznese dhe shtëpi: kamera, kontroll aksesi dhe orari, barriera, alarm zjarri dhe vjedhjeje, interkom dhe evakuim zanor.\n\nPër qendrat e monitorimit ndërtojmë salla kontrolli të plota, me mobilje ergonomike, video wall, KVM dhe UPS, që punojnë pa ndërprerje.',
      'Fredi Electronics installs security for institutions, businesses and homes: CCTV, access control and time attendance, barriers, fire and intrusion alarms, intercom and voice evacuation.\n\nFor monitoring centres we build complete control rooms with ergonomic desks, video walls, KVM and UPS, made to run without interruption.',
    ],
    highlights: [
      ['Salla kontrolli', 'Mobilje ergonomike, video wall, KVM', 'Control rooms', 'Ergonomic desks, video walls, KVM'],
      ['Evakuim EN54', 'Njoftim zanor sipas zonave', 'EN54 evacuation', 'Zone-based voice alarm'],
      ['Nga kamera te barriera', 'Gjithçka në një sistem', 'From camera to barrier', 'Everything in one system'],
    ],
    subs: [
      { sq: 'Kamera sigurie', en: 'Security cameras', tSq: 'Kamera IP, analoge dhe termike, me regjistrues NVR/DVR dhe shikim nga telefoni.', tEn: 'IP, analogue and thermal cameras with NVR/DVR recorders and viewing from your phone.', iSq: 'IP, analoge, termike, PTZ, NVR/DVR', iEn: 'IP, analogue, thermal, PTZ, NVR/DVR', cats: ['security-cameras', 'ip-network-cameras', 'special-cameras', 'nvr'] },
      { sq: 'Kontroll aksesi & orari', en: 'Access control & time attendance', tSq: 'Lexues karte dhe gjurmë gishti, tripodë, porta xhami dhe regjistrim i orëve të punës.', tEn: 'Card and fingerprint readers, tripod turnstiles, glass gates and working-hours tracking.', iSq: 'Lexues, tripodë, porta, orar pune', iEn: 'Readers, tripods, gates, time attendance', cats: ['access-control', 'time-attendance', 'tripods'] },
      { sq: 'Barriera & parkim', en: 'Barriers & parking', tSq: 'Barriera automatike, bllokues parkimi dhe dyer automatike rrëshqitëse.', tEn: 'Automatic barriers, parking locks and automatic sliding doors.', iSq: 'Barriera, bllokues, dyer automatike', iEn: 'Barriers, parking locks, automatic doors', cats: ['parking-barriers'], proj: [32] },
      { sq: 'Alarm & zjarr', en: 'Alarm & fire', tSq: 'Alarm vjedhjeje, perimetri dhe zjarri, adresues dhe konvencional.', tEn: 'Intrusion, perimeter and fire alarms, addressable and conventional.', iSq: 'Lëvizje, perimetër, zjarr adresues/konvencional', iEn: 'Motion, perimeter, addressable/conventional fire', cats: ['fire-alarm', 'alarm-systems', 'perimetral-alarm', 'motion-alarm'] },
      { sq: 'Interkom, evakuim & smart home', en: 'Intercom, evacuation & smart home', tSq: 'Videocitofona, njoftim zanor dhe evakuim EN54, si edhe kontroll i shtëpisë nga telefoni.', tEn: 'Video intercoms, voice alarm and EN54 evacuation, plus home control from your phone.', iSq: 'Videocitofon, PA, EN54, smart home', iEn: 'Video intercom, PA, EN54, smart home', cats: ['video-intercom', 'smart-home'] },
    ],
  },
  {
    slug: 'power', order: 5, cat: 'power', brands: ['Tescom', 'Inform', 'Aytemiz Makelsan'],
    title: ['Energji & UPS', 'Power & UPS'],
    lead: ['Energji e pandërprerë për pajisjet që nuk duhet të fiken.', 'Uninterrupted power for equipment that must stay on.'],
    intro: [
      'UPS online dhe line-interactive, invertorë dhe instalime elektrike për gjykata, ministri, salla serverash dhe biznese. Llogarisim fuqinë, instalojmë, testojmë dhe mirëmbajmë.\n\nPunojmë me Tescom, Inform dhe Aytemiz Makelsan, nga UPS të vegjël për zyra deri te sisteme me fuqi MVA.',
      'Online and line-interactive UPS, inverters and electrical installations for courts, ministries, server rooms and businesses. We size the load, install, test and maintain.\n\nWe work with Tescom, Inform and Aytemiz Makelsan, from small office UPS units to MVA-range systems.',
    ],
    highlights: [
      ['Deri në MVA', 'Nga zyra te qendra të dhënash', 'Up to MVA', 'From offices to data centres'],
      ['Instalim & testim', 'Bëhet nga ekipi ynë', 'Installed & tested', 'By our own team'],
      ['Mirëmbajtje', 'Kontrolle të rregullta dhe bateri', 'Maintenance', 'Regular checks and batteries'],
    ],
    subs: [
      { sq: 'UPS online & line-interactive', en: 'Online & line-interactive UPS', tSq: 'UPS me konvertim të dyfishtë për pajisje kritike dhe UPS line-interactive për zyra.', tEn: 'Double-conversion UPS for critical equipment and line-interactive UPS for offices.', iSq: '1 – 800 kVA, monofazë, trefazë, bateri', iEn: '1 – 800 kVA, single and three phase, batteries', cats: ['ups', 'aytemiz-makelsan'] },
      { sq: 'Invertorë', en: 'Inverters', tSq: 'Invertorë për rezervë energjie dhe sisteme diellore.', tEn: 'Inverters for backup power and solar systems.', iSq: 'Invertorë, rregullatorë tensioni', iEn: 'Inverters, voltage regulators', cats: ['inverter'] },
      { sq: 'Instalime elektrike', en: 'Electrical installations', tSq: 'Panele elektrike, kabllim dhe furnizim i sigurt për sistemet që instalojmë.', tEn: 'Electrical panels, cabling and safe power for the systems we install.', iSq: 'Panele, kabllim, mbrojtje', iEn: 'Panels, cabling, protection', cats: ['electrical'] },
    ],
  },
  {
    slug: 'accessories', order: 6, brands: ['Lenovo', 'HP'],
    title: ['Aksesorë elektrikë & elektronikë', 'Electrical & electronic accessories'],
    lead: ['Kabllo, adaptorë, komponentë dhe pajisje IT.', 'Cables, adapters, components and IT equipment.'],
    intro: [
      'Fredi Electronics filloi në 1992 me shitjen e qarqeve elektronike, dhe sot ofron ende gjithçka që i duhet një instalimi: kabllo dhe adaptorë, furnizues energjie, komponentë, pjesë altoparlantësh dhe pajisje IT.\n\nNa tregoni çfarë ju duhet dhe ju dërgojmë ofertë.',
      'Fredi Electronics started in 1992 selling electronic circuits, and still supplies everything an installation needs: cables and adapters, power supplies, components, speaker parts and IT equipment.\n\nTell us what you need and we will send you an offer.',
    ],
    highlights: [],
    subs: [
      { sq: 'Kabllo & adaptorë', en: 'Cables & adapters', tSq: 'Kabllo audio, video dhe rrjeti, konektorë dhe adaptorë.', tEn: 'Audio, video and network cables, connectors and adapters.', iSq: 'XLR, HDMI, Speakon, rrjet, adaptorë', iEn: 'XLR, HDMI, Speakon, network, adapters', cats: ['cables-and-adapters', 'converters-adaptors'] },
      { sq: 'Komponentë elektronikë', en: 'Electronic components', tSq: 'Furnizues energjie, qarqe, kondensatorë dhe transformatorë.', tEn: 'Power supplies, circuits, capacitors and transformers.', iSq: 'Furnizues, qarqe, kondensatorë, transformatorë', iEn: 'Power supplies, circuits, capacitors, transformers', cats: ['power-supplies', 'circuits-capacitors', 'electronics'] },
      { sq: 'Pjesë altoparlantësh', en: 'Speaker parts', tSq: 'Woofer, horn, membrana, crossover dhe pjesë për riparim.', tEn: 'Woofers, horns, diaphragms, crossovers and repair parts.', iSq: 'Woofer, horn, membrana, crossover', iEn: 'Woofers, horns, diaphragms, crossovers', cats: ['speaker-components'] },
      { sq: 'IT & rrjeti', en: 'IT & networking', tSq: 'Kompjuterë all-in-one, laptopë, switch dhe ekrane prekëse.', tEn: 'All-in-one computers, laptops, switches and touch panels.', iSq: 'All-in-one, laptopë, switch, ekrane prekëse', iEn: 'All-in-one PCs, laptops, switches, touch panels', cats: ['all-in-one-pc', 'computers', 'switches'] },
    ],
  },
]

for (const s of S) {
  const exists = (await payload.find({ collection: 'services', where: { slug: { equals: s.slug } }, limit: 1, depth: 0 })).docs[0]
  if (exists) { log('skip (exists):', s.slug); continue }
  const subs = []
  for (const x of s.subs) subs.push({ title: x.sq, text: x.tSq, items: x.iSq, photos: await photosFor(x.cats, x.proj) })
  const doc = await payload.create({
    collection: 'services', locale: 'sq',
    data: {
      slug: s.slug as 'led', order: s.order, title: s.title[0], lead: s.lead[0], intro: s.intro[0],
      projectCategory: s.cat as 'led' | undefined,
      highlights: s.highlights.map((h) => ({ title: h[0], text: h[1] })),
      subsections: subs, partners: s.brands.map((b) => brandId[b]),
    },
  })
  // English: same rows, matched by position (array rows keep their ids across locales)
  const full = await payload.findByID({ collection: 'services', id: doc.id, locale: 'sq', depth: 0 })
  await payload.update({
    collection: 'services', id: doc.id, locale: 'en',
    data: {
      title: s.title[1], lead: s.lead[1], intro: s.intro[1],
      highlights: (full.highlights || []).map((h, i) => ({ ...h, title: s.highlights[i][2], text: s.highlights[i][3] })),
      subsections: (full.subsections || []).map((r, i) => ({ ...r, title: s.subs[i].en, text: s.subs[i].tEn, items: s.subs[i].iEn })),
    },
  })
  log('service', s.slug, subs.map((x) => x.photos.length).join('/'))
}

/* ---------- split Audio & Konferencë: conference rooms move to the new category ---------- */
const CONF = [2, 4, 8, 9, 10, 12, 13, 16, 19, 20, 21, 25, 36, 40, 41, 42, 43, 60, 62]
for (const id of CONF) await payload.update({ collection: 'projects', id, data: { category: 'conf' } })
log('moved', CONF.length, 'projects to Konferenca')
log('done')
process.exit(0)
