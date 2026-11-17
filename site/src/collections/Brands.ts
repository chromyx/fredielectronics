import type { CollectionConfig } from 'payload'

// Brands Fredi Electronics distributes or installs. Shown as "Partners" on the service pages.
export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Brand', plural: 'Brands (partners)' },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'logo'],
    description: 'Brand partners. Pick them inside a service to show their logos on that service page.',
  },
  defaultSort: 'name',
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'Without a logo the name is shown instead.' } },
  ],
}
