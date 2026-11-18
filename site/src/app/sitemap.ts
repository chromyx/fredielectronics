import type { MetadataRoute } from 'next'
import { SERVICE_SLUGS } from '@/collections/Services'
import { CATS } from '@/lib/cats'
import { categoryPath, homePath, servicePath } from '@/lib/routes'
import { SITE_URL } from '@/lib/seo'

// sitemap.xml: every public page in both languages, with hreflang alternates.
export default function sitemap(): MetadataRoute.Sitemap {
  const pairs: [string, string, number][] = [
    [homePath('sq'), homePath('en'), 1],
    ...SERVICE_SLUGS.map(({ value }) => [servicePath('sq', value), servicePath('en', value), 0.8] as [string, string, number]),
    ...CATS.map((c) => [categoryPath('sq', c), categoryPath('en', c), 0.7] as [string, string, number]),
  ]
  const now = new Date()
  return pairs.flatMap(([sq, en, priority]) => {
    const languages = { sq: SITE_URL + sq, en: SITE_URL + en }
    return [
      { url: SITE_URL + sq, lastModified: now, priority, alternates: { languages } },
      { url: SITE_URL + en, lastModified: now, priority: priority - 0.1, alternates: { languages } },
    ]
  })
}
