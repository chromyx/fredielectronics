/**
 * Copies every project's photos into a clean, sorted folder:
 *   <out>/<category>/<project title>/<project title> - 01.jpg, - 02.jpg, …  (cover first, gallery order)
 * Run with:  npx payload run src/seed/export-sorted.ts -- --out=<folder> [--also=<title of a hidden project>]
 * Only projects shown on the site are exported, plus hidden ones named with --also.
 * The output folder is rebuilt from scratch each run.
 */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3)
const OUT = arg('out')
if (!OUT) throw new Error('Pass --out=<folder>')
const also = process.argv.filter((a) => a.startsWith('--also=')).map((a) => a.slice(7))
const MARK = path.join(OUT, 'LISTA.txt')
if (fs.existsSync(OUT)) {
  if (!fs.existsSync(MARK)) throw new Error(`${OUT} exists and was not made by this script`)
  fs.rmSync(OUT, { recursive: true })
}

const CAT: Record<string, string> = { led: '1 - Ekrane LED', av: '2 - Audio', conf: '3 - Konferenca', sec: '4 - Siguri dhe akses', power: '5 - Energji' }
const clean = (s: string) => s.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim()

const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'projects', locale: 'sq', limit: 500, depth: 1, sort: 'order' })
const lines: string[] = []
let total = 0
for (const p of docs) {
  const title = clean(p.title as string)
  const hidden = p.published === false
  if (hidden && !also.includes(title)) continue
  const dir = path.join(OUT, hidden ? '_Pa emër (jo në faqe)' : CAT[p.category as string] || '_Pa kategori', title)
  fs.mkdirSync(dir, { recursive: true })
  const photos = (p.gallery as { filename?: string }[]).filter((g) => g?.filename)
  photos.forEach((g, i) => {
    const ext = path.extname(g.filename!).toLowerCase().replace('.jpeg', '.jpg')
    fs.copyFileSync(path.join(process.cwd(), 'media', g.filename!), path.join(dir, `${title} - ${String(i + 1).padStart(2, '0')}${ext}`))
  })
  total += photos.length
  lines.push(`${path.relative(OUT, dir)}  (${photos.length})`)
}
lines.sort()
fs.writeFileSync(MARK, [`Fredi Electronics – foto të zgjedhura (vetëm punë të përfunduara)`, `${lines.length} projekte, ${total} foto`, '', ...lines, ''].join('\r\n'), 'utf8')
console.log(`[export] ${lines.length} projects, ${total} photos -> ${OUT}`)
process.exit(0)
