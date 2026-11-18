import { notFound } from 'next/navigation'
import { ServicePage } from '@/components/ServicePage'
import { getServicePage } from '@/lib/getHomeData'
import { servicePath } from '@/lib/routes'
import { alternates } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getServicePage('sq', slug)
  return data
    ? {
        title: `${data.service.title} – Fredi Electronics`,
        description: data.service.lead,
        alternates: alternates(servicePath('sq', slug), servicePath('en', slug), 'sq'),
      }
    : {}
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getServicePage('sq', slug)
  if (!data) notFound()
  return <ServicePage data={data} altHref={servicePath('en', slug)} />
}
