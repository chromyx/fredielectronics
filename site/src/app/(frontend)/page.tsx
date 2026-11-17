import { Site } from '@/components/Site'
import { getHomeData } from '@/lib/getHomeData'

// Albanian homepage. Re-rendered on every request so admin changes show immediately.
export const dynamic = 'force-dynamic'

export default async function Page() {
  const data = await getHomeData('sq')
  return <Site data={data} />
}
