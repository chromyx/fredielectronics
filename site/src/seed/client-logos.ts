/**
 * Attaches logos to the clients in "Clients & partners".
 * Run with:  npx payload run src/seed/client-logos.ts -- "<folder with the chosen logo files>"
 * Expects files named "<client name>.<ext>" (svg/png/jpg); converts each to a trimmed PNG first.
 * Clients that already have a logo are left alone.
 */
import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '@payload-config'

const DIR = process.argv.slice(2).find((a) => fs.existsSync(a))
if (!DIR) throw new Error('Pass the folder with the logo files')

const payload = await getPayload({ config })
const clients = await payload.find({ collection: 'clients', limit: 200, depth: 0 })
const files = fs.readdirSync(DIR)

for (const c of clients.docs) {
  if (c.logo) { console.log('[logos] has logo:', c.name); continue }
  const file = files.find((f) => path.parse(f).name === c.name)
  if (!file) { console.log('[logos] no file for:', c.name); continue }
  // Same size and format for every logo, with transparent edges trimmed so they line up.
  const png = path.join(os.tmpdir(), `logo-${c.id}.png`)
  await sharp(path.join(DIR, file), { density: 300 }).trim().resize(600, 300, { fit: 'inside', withoutEnlargement: false }).png().toFile(png)
  const media = await payload.create({ collection: 'media', data: { alt: c.name }, filePath: png })
  await payload.update({ collection: 'clients', id: c.id, data: { logo: media.id } })
  console.log('[logos] set:', c.name)
}
process.exit(0)
