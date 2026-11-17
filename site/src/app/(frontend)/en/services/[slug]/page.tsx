import { notFound } from 'next/navigation'
import { ServicePage } from '@/components/ServicePage'
import { getServicePage } from '@/lib/getHomeData'
import { servicePath } from '@/lib/routes'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getServicePage('en', (await params).slug)
  return data ? { title: `${data.service.title} – Fredi Electronics`, description: data.service.lead } : {}
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getServicePage('en', slug)
  if (!data) notFound()
  return <ServicePage data={data} altHref={servicePath('sq', slug)} />
}
