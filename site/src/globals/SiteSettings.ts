import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Contact details & numbers',
  admin: {
    group: 'Settings',
    description: 'Shown in the top bar, contact section, footer and WhatsApp button.',
  },
  access: { read: () => true },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: 'Phone (as shown)', defaultValue: '+355 69 675 2032', admin: { width: '50%' } },
        { name: 'whatsapp', type: 'text', label: 'WhatsApp number (digits only)', defaultValue: '355696752032', admin: { width: '50%', description: 'Country code + number, no spaces or +.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', defaultValue: 'fredielectronics@gmail.com', admin: { width: '50%' } },
        { name: 'email2', type: 'email', label: 'Second email (optional)', defaultValue: 'info@fredielectronics.com', admin: { width: '50%' } },
        { name: 'instagram', type: 'text', label: 'Instagram username', defaultValue: 'fredielectronics', admin: { width: '50%' } },
        { name: 'facebook', type: 'text', label: 'Facebook page link', defaultValue: 'https://www.facebook.com/fredielectronics/', admin: { width: '50%' } },
        { name: 'linkedin', type: 'text', label: 'LinkedIn page link', defaultValue: 'https://www.linkedin.com/in/fredielectronics/', admin: { width: '50%' } },
      ],
    },
    { name: 'address', type: 'text', defaultValue: 'Rr. Kavajës, P.207, Sh.2, Tiranë 1001' },
    { name: 'hours', type: 'textarea', label: 'Opening hours', localized: true, admin: { description: 'One line per day group, e.g. "E hënë – e premte: 08:00–17:00".' } },
    {
      type: 'collapsible',
      label: 'Key numbers (blue panel under the top photo)',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'founded', type: 'number', label: 'Founded', defaultValue: 1991 },
            { name: 'projectsDone', type: 'number', label: 'Projects completed', defaultValue: 700 },
            { name: 'brands', type: 'number', label: 'Brand partners', defaultValue: 30 },
          ],
        },
      ],
    },
  ],
}
