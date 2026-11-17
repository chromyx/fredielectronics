import type { CollectionConfig } from 'payload'
import { CATEGORIES } from './Projects'

// One page per service (Shërbimet tona). The menu lists them in "Order".
export const SERVICE_SLUGS = [
  { label: 'LED displays & video', value: 'led' },
  { label: 'Audio', value: 'audio' },
  { label: 'Conference', value: 'conference' },
  { label: 'Security & access', value: 'security' },
  { label: 'Power & UPS', value: 'power' },
  { label: 'Electrical & electronic accessories', value: 'accessories' },
]

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order'],
    description: 'Each service has its own page under "Shërbimet tona". Switch the language at the top to edit English.',
  },
  defaultSort: 'order',
  access: { read: () => true },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, admin: { width: '50%' } },
        { name: 'slug', type: 'select', options: SERVICE_SLUGS, required: true, unique: true, admin: { width: '30%', description: 'Web address. Do not change.' } },
        { name: 'order', type: 'number', admin: { width: '20%' } },
      ],
    },
    { name: 'lead', type: 'text', localized: true, label: 'One line', admin: { description: 'Shown in the menu, on the homepage tile and at the top of the project category page.' } },
    { name: 'intro', type: 'textarea', localized: true, label: 'Introduction', admin: { description: 'One or two paragraphs. Leave an empty line between paragraphs.' } },
    {
      name: 'highlights',
      type: 'array',
      label: 'Key points',
      maxRows: 4,
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'text', type: 'text', localized: true },
      ],
    },
    {
      name: 'projectCategory',
      type: 'select',
      options: CATEGORIES,
      label: 'Projects shown on this page',
      admin: { description: 'Leave empty if this service has no projects.' },
    },
    { name: 'photo', type: 'upload', relationTo: 'media', label: 'Main photo', admin: { description: 'Leave empty to use a photo from its projects.' } },
    {
      name: 'subsections',
      type: 'array',
      label: 'What we offer',
      admin: { description: 'For example: ceiling speakers, amplifiers, mixers. Each gets a short text and a few photos.' },
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'text', type: 'textarea', localized: true },
        { name: 'items', type: 'text', localized: true, label: 'Product types (comma separated)', admin: { description: 'e.g. "In-ceiling, wall, horn, column"' } },
        { name: 'photos', type: 'upload', relationTo: 'media', hasMany: true, maxRows: 4 },
      ],
    },
    { name: 'partners', type: 'relationship', relationTo: 'brands', hasMany: true, label: 'Partner brands' },
  ],
}
