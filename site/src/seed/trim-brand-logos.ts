/** Re-uploads each brand logo with its empty border trimmed, so all logos sit at the same visual size. */
import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const brands = await payload.find({ collection: 'brands', limit: 100, depth: 1 })
for (const b of brands.docs) {
  const logo = b.logo as { filename?: string; alt?: string } | null
  if (!logo?.filename || logo.filename.startsWith('trim-')) continue
  const src = path.join(process.cwd(), 'media', logo.filename)
  const out = path.join(os.tmpdir(), `trim-${b.id}-${b.name.replace(/\W+/g, '')}.png`)
  await sharp(src).flatten({ background: '#ffffff' }).trim({ threshold: 18 }).resize(600, 240, { fit: 'inside', withoutEnlargement: false })
    .extend({ top: 4, bottom: 4, left: 4, right: 4, background: '#ffffff' }).png().toFile(out)
  const m = await payload.create({ collection: 'media', data: { alt: b.name }, filePath: out })
  await payload.update({ collection: 'brands', id: b.id, data: { logo: m.id } })
  fs.rmSync(out)
  console.log('[trim]', b.name)
}
process.exit(0)
