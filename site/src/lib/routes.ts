import type { Category, Locale } from './getHomeData'

// Web addresses. Albanian lives at the root, English under /en.
export const CAT_SLUG: Record<Category, string> = { led: 'led', av: 'audio', conf: 'conference', sec: 'security', power: 'power' }
export const SLUG_CAT = Object.fromEntries(Object.entries(CAT_SLUG).map(([k, v]) => [v, k])) as Record<string, Category>

export const homePath = (l: Locale, anchor = '') => (l === 'sq' ? '/' : '/en') + (anchor ? `#${anchor}` : '')
export const servicePath = (l: Locale, slug: string) => (l === 'sq' ? `/sherbimet/${slug}` : `/en/services/${slug}`)
export const categoryPath = (l: Locale, c: Category) => (l === 'sq' ? `/projektet/${CAT_SLUG[c]}` : `/en/projects/${CAT_SLUG[c]}`)
