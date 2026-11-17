import { headers } from 'next/headers'
import { NotFoundPage } from '@/components/NotFoundPage'
import { getShell } from '@/lib/getHomeData'

// Shown for addresses that do not exist (e.g. an old WordPress link).
export default async function NotFound() {
  const path = (await headers()).get('x-pathname') || ''
  const locale = path.startsWith('/en') ? 'en' : 'sq'
  return <NotFoundPage shell={await getShell(locale)} />
}
