import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// robots.txt: index the public site, keep the admin and API out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    // Photos are served from /api/media/, so that part of the API stays crawlable for image search.
    rules: { userAgent: '*', allow: ['/', '/api/media/'], disallow: ['/admin', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
