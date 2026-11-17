import { notFound } from 'next/navigation'
import { CategoryPage } from '@/components/CategoryPage'
import { getCategoryPage } from '@/lib/getHomeData'
import { categoryPath, SLUG_CAT } from '@/lib/routes'
import { UI } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const c = SLUG_CAT[(await params).cat]
  return c ? { title: `${UI.en.nav_projects}: ${UI.en.cat[c]} – Fredi Electronics` } : {}
}

export default async function Page({ params }: { params: Promise<{ cat: string }> }) {
  const c = SLUG_CAT[(await params).cat]
  if (!c) notFound()
  const data = await getCategoryPage('en', c)
  return <CategoryPage data={data} altHref={categoryPath('sq', c)} />
}
