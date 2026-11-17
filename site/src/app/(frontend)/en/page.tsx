import { Site } from '@/components/Site'
import { getHomeData } from '@/lib/getHomeData'

// English homepage.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fredi Electronics – Systems integrator since 1991',
}

export default async function Page() {
  const data = await getHomeData('en')
  return <Site data={data} />
}
