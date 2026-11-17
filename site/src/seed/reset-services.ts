/** Deletes all services so services.ts can recreate them (brands and photos are kept). */
import { getPayload } from 'payload'
import config from '@payload-config'
const payload = await getPayload({ config })
const r = await payload.delete({ collection: 'services', where: { id: { exists: true } } })
console.log('[reset] deleted', r.docs.length)
process.exit(0)
