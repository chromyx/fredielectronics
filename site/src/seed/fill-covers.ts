// One-off: give every project without a cover its first photo as cover (the beforeChange hook does the rest).
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const all = await payload.find({ collection: 'projects', limit: 500, depth: 0, where: { cover: { exists: false } } })
for (const p of all.docs) await payload.update({ collection: 'projects', id: p.id, data: {} })
console.log('[covers] updated', all.docs.length)
process.exit(0)
