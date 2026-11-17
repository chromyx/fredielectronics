import type { CollectionConfig } from 'payload'

// Contact-form submissions. Anyone can send one; only logged-in admins can read them.
export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Message', plural: 'Messages' },
  admin: {
    group: 'Inbox',
    useAsTitle: 'name',
    defaultColumns: ['name', 'contact', 'createdAt', 'handled'],
    description: 'Messages sent from the contact form on the website.',
  },
  defaultSort: '-createdAt',
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 120 },
    { name: 'contact', type: 'text', label: 'Email or phone', required: true, maxLength: 160 },
    { name: 'message', type: 'textarea', required: true, maxLength: 5000 },
    { name: 'handled', type: 'checkbox', label: 'Replied / done', defaultValue: false, admin: { position: 'sidebar' } },
  ],
}
