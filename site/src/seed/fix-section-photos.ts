/**
 * Swaps repeated or unclear product photos in a few service sections for clearer ones from the old shop.
 * Run with:  npx payload run src/seed/fix-section-photos.ts
 */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const BACKUP = path.resolve(process.cwd(), '..', 'backup')
type WpProduct = { name: string; images?: { src: string }[]; categories: { slug: string }[] }
const products: WpProduct[] = JSON.parse(fs.readFileSync(path.join(BACKUP, 'data', 'products.json'), 'utf8'))
const payload = await getPayload({ config })

function fileOf(p: WpProduct) {
  const rel = p.images?.[0]?.src.split('/wp-content/uploads/')[1]
  if (!rel) return null
  const f = path.join(BACKUP, 'images', rel)
  if (fs.existsSync(f)) return f
  const plain = f.replace(/-scaled(\.\w+)$/, '$1')
  return fs.existsSync(plain) ? plain : null
}
async function upload(match: (p: WpProduct) => boolean) {
  const p = products.find((x) => match(x) && fileOf(x))
  if (!p) throw new Error('no product found')
  return (await payload.create({ collection: 'media', data: { alt: p.name.replace(/&#0?38;|&amp;/g, '&') }, filePath: fileOf(p)! })).id as number
}
const clean = (s: string) => s.replace(/&#0?38;|&amp;/g, '&').trim()
const byName = (n: string) => (p: WpProduct) => clean(p.name) === n
const inCat = (slug: string) => (p: WpProduct) => p.categories.some((c) => c.slug === slug)

// service slug -> section index -> new photos (null keeps the photo already at that position)
const PLAN: Record<string, Record<number, (number | null | ((p: WpProduct) => boolean))[]>> = {
  // accessories (sections 0 and 3) were already swapped on 2026-11-17
  security: {
    1: [byName('ZKT-BIO SECURITY UP 25 DOOR ACCESS CONTROL'), byName('ZKT-ZPAD-PLUS-FP-1-S ANDROID T&A'), byName('ZKT-DL-L7000-U SMART LOCK'), byName('RFID Silikon BYZYLYK (125 Khz EM)')],
  },
}

for (const [slug, sections] of Object.entries(PLAN)) {
  const s = (await payload.find({ collection: 'services', where: { slug: { equals: slug } }, limit: 1, depth: 0, locale: 'sq' })).docs[0]
  if (!s) continue
  const subs = (s.subsections || []).map((x) => ({ ...x, photos: [...((x.photos as number[]) || [])] }))
  for (const [i, wanted] of Object.entries(sections)) {
    const old = subs[Number(i)].photos
    // keep the first photos as listed (null), then add the new ones; drop the rest
    const kept = old.filter((_, j) => wanted[j] === null)
    const fresh: number[] = []
    for (const w of wanted) if (typeof w === 'function') fresh.push(await upload(w))
    subs[Number(i)].photos = [...kept, ...fresh]
  }
  await payload.update({ collection: 'services', id: s.id, locale: 'sq', data: { subsections: subs } })
  console.log('[photos]', slug, Object.keys(sections).join(','))
}
process.exit(0)
