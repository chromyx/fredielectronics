import type { Metadata } from 'next'

// Public address of the live site. Used for canonical links, hreflang, sitemap.xml and robots.txt.
export const SITE_URL = (process.env.SITE_URL || 'https://fredielectronics.com').replace(/\/$/, '')

// Canonical + language alternates for a page that exists in both languages.
export function alternates(sqPath: string, enPath: string, current: 'sq' | 'en'): Metadata['alternates'] {
  return {
    canonical: current === 'sq' ? sqPath : enPath,
    languages: { sq: sqPath, en: enPath, 'x-default': sqPath },
  }
}
