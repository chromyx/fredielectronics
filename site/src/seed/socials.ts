/** Saves the Facebook and LinkedIn links in Site settings (also adds the new database columns). */
import { getPayload } from 'payload'
import config from '@payload-config'
const payload = await getPayload({ config })
await payload.updateGlobal({ slug: 'site-settings', data: { instagram: 'fredielectronics', facebook: 'https://www.facebook.com/fredielectronics/', linkedin: 'https://www.linkedin.com/in/fredielectronics/' } as never })
const s = await payload.findGlobal({ slug: 'site-settings' })
console.log('[socials]', (s as { facebook?: string }).facebook, (s as { linkedin?: string }).linkedin)
process.exit(0)
