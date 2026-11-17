import type { CollectionConfig } from 'payload'

export const CATEGORIES = [
  { label: 'LED displays / Ekrane LED', value: 'led' },
  { label: 'Audio / Audio', value: 'av' },
  { label: 'Conference / Konferenca', value: 'conf' },
  { label: 'Security & Access / Siguri & Akses', value: 'sec' },
  { label: 'Power & UPS / Energji & UPS', value: 'power' },
]

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Projects' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['cover', 'title', 'category', 'featured', 'published'],
    description: 'Your portfolio. Click "Create new", add a title, pick a category, drag in photos and save.',
    listSearchableFields: ['title', 'client', 'location'],
  },
  defaultSort: 'order',
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // No cover chosen: use the first photo, so lists and cards always have a picture.
        const first = Array.isArray(data.gallery) ? data.gallery[0] : undefined
        if (!data.cover && first) data.cover = typeof first === 'object' ? first.id : first
        if (data.published === undefined || data.published === null) data.published = true
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', label: 'Title', required: true, localized: true, admin: { width: '60%' } },
        { name: 'category', type: 'select', label: 'Category', required: true, options: CATEGORIES, defaultValue: 'led', admin: { width: '40%' } },
      ],
    },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Photos',
      required: true,
      admin: { description: 'Drag photos here or click to upload several at once. The first photo is the cover unless you choose one below.' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
      admin: { description: 'What was done. Switch the language at the top of the page to write the English version.' },
    },
    {
      type: 'collapsible',
      label: 'More details (optional)',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'client', type: 'text', label: 'Client', admin: { width: '40%' } },
            { name: 'location', type: 'text', label: 'City / location', admin: { width: '40%' } },
            { name: 'year', type: 'number', label: 'Year', admin: { width: '20%' } },
          ],
        },
        { name: 'cover', type: 'upload', relationTo: 'media', label: 'Cover photo', admin: { description: 'Leave empty to use the first photo.' } },
        { name: 'heroPhoto', type: 'upload', relationTo: 'media', label: 'Photo for the homepage slideshow', admin: { description: 'Only used if "Show on homepage" is on. Wide (landscape) photos work best.', condition: (data) => Boolean(data?.featured) } },
        { name: 'order', type: 'number', label: 'Order', admin: { description: 'Lower numbers show first. Leave empty to show newest first.' } },
        {
          name: 'slug',
          type: 'text',
          unique: true,
          index: true,
          admin: { description: 'Web address. Filled in automatically.' },
          hooks: {
            beforeValidate: [({ value, data }) => value || (typeof data?.title === 'string' ? slugify(data.title) : value)],
          },
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Show on homepage slideshow',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Visible on website',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Untick to hide without deleting.' },
    },
  ],
}
