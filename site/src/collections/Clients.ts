import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  labels: { singular: 'Client', plural: 'Clients & partners' },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'logo'],
    description: 'Institutions you worked for and brands you partner with. Add a logo when you have one.',
  },
  defaultSort: 'order',
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'client',
      options: [
        { label: 'Client', value: 'client' },
        { label: 'Brand partner', value: 'partner' },
      ],
    },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', admin: { description: 'Lower numbers show first.' } },
  ],
}
