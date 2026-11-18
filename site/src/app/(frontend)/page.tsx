import { Site } from '@/components/Site'
import { getHomeData } from '@/lib/getHomeData'
import { alternates } from '@/lib/seo'

// Albanian homepage. Re-rendered on every request so admin changes show immediately.
export const dynamic = 'force-dynamic'

export const metadata = { alternates: alternates('/', '/en', 'sq') }

export default async function Page() {
  const data = await getHomeData('sq')
  return <Site data={data} />
}
