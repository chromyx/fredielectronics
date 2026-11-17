import type { GlobalConfig } from 'payload'
import { CATEGORIES } from '../collections/Projects'

// All homepage wording. Each text field has an Albanian and an English version:
// switch the language at the top of the admin page to edit the other one.
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Homepage text',
  admin: {
    group: 'Content',
    description: 'Edit the wording of each homepage section. Switch the language at the top to edit English.',
  },
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Top (hero)',
          fields: [
            { name: 'heroLine1', type: 'text', label: 'Headline – line 1', localized: true },
            { name: 'heroLine2', type: 'text', label: 'Headline – line 2', localized: true },
            { name: 'heroText', type: 'textarea', label: 'Text under the headline', localized: true },
          ],
        },
        {
          label: 'About us',
          fields: [
            { name: 'aboutTitle', type: 'text', label: 'Title', localized: true },
            { name: 'aboutText1', type: 'textarea', label: 'Paragraph 1', localized: true },
            { name: 'aboutText2', type: 'textarea', label: 'Paragraph 2', localized: true },
            { name: 'aboutPoints', type: 'array', label: 'Checklist', maxRows: 6, fields: [{ name: 'text', type: 'text', localized: true, required: true }] },
            { name: 'aboutPhoto', type: 'upload', relationTo: 'media', label: 'Photo' },
          ],
        },
        {
          label: 'Services',
          fields: [
            { name: 'servicesIntro', type: 'text', label: 'Short line under "Our services"', localized: true },
            { name: 'steps', type: 'array', label: 'How we work (steps)', maxRows: 6, fields: [{ name: 'text', type: 'text', localized: true, required: true }] },
            {
              name: 'services',
              type: 'array',
              label: 'Service tiles',
              maxRows: 8,
              admin: { hidden: true, description: 'Replaced by the Services collection.' },
              fields: [
                { type: 'row', fields: [
                  { name: 'title', type: 'text', localized: true, required: true, admin: { width: '60%' } },
                  { name: 'category', type: 'select', options: CATEGORIES, required: true, admin: { width: '40%' } },
                ] },
                { name: 'text', type: 'text', localized: true },
                { name: 'photo', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Projects',
          fields: [
            { name: 'projectsTitle', type: 'text', label: 'Title', localized: true },
            { name: 'projectsText', type: 'textarea', label: 'Text next to the title', localized: true },
          ],
        },
        {
          label: 'FAV × TEG',
          fields: [
            { name: 'favSubtitle', type: 'text', label: 'Subtitle', localized: true },
            { name: 'favText', type: 'textarea', label: 'Text', localized: true },
            { name: 'favStats', type: 'array', label: 'Numbers', maxRows: 4, fields: [
              { type: 'row', fields: [
                { name: 'value', type: 'text', required: true, admin: { width: '35%' } },
                { name: 'label', type: 'text', localized: true, required: true, admin: { width: '65%' } },
              ] },
            ] },
            { name: 'favLink', type: 'text', label: 'Website link', defaultValue: 'https://fav.al/' },
            { name: 'favPhoto', type: 'upload', relationTo: 'media', label: 'Photo of the screens (optional)', admin: { description: 'If set, replaces the animated sample screen.' } },
          ],
        },
        {
          label: 'Clients & contact',
          fields: [
            { name: 'clientsTitle', type: 'text', label: 'Clients title', localized: true },
            { name: 'contactTitle', type: 'text', label: 'Contact title', localized: true },
            { name: 'contactText', type: 'textarea', label: 'Contact text', localized: true },
          ],
        },
      ],
    },
  ],
}
