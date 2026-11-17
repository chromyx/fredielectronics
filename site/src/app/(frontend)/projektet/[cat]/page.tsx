import { notFound } from 'next/navigation'
import { CategoryPage } from '@/components/CategoryPage'
import { getCategoryPage } from '@/lib/getHomeData'
import { categoryPath, SLUG_CAT } from '@/lib/routes'
import { UI } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const c = SLUG_CAT[(await params).cat]
  return c ? { title: `${UI.sq.nav_projects}: ${UI.sq.cat[c]} – Fredi Electronics` } : {}
}

export default async function Page({ params }: { params: Promise<{ cat: string }> }) {
  const c = SLUG_CAT[(await params).cat]
  if (!c) notFound()
  const data = await getCategoryPage('sq', c)
  return <CategoryPage data={data} altHref={categoryPath('en', c)} />
}
