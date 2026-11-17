import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo', plural: 'Photos & files' },
  admin: {
    group: 'Content',
    description: 'All photos used on the website. You can also upload photos directly inside a project.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Short description (optional)',
      admin: { description: 'Helps Google and visitors using screen readers. Example: "LED screen in Burrel".' },
    },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    // Smaller copies are made automatically so the site stays fast.
    imageSizes: [
      { name: 'thumb', width: 480 },
      { name: 'card', width: 960 },
      { name: 'large', width: 1920 },
    ],
    adminThumbnail: 'thumb',
    focalPoint: true,
  },
}
