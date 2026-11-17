import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Clients } from './collections/Clients'
import { Messages } from './collections/Messages'
import { Services } from './collections/Services'
import { Brands } from './collections/Brands'
import { SiteSettings } from './globals/SiteSettings'
import { HomePage } from './globals/HomePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' – Fredi Electronics',
    },
  },
  collections: [Projects, Services, Brands, Media, Clients, Messages, Users],
  globals: [HomePage, SiteSettings],
  // Every text the visitor reads exists in Albanian (default) and English.
  localization: {
    locales: [
      { code: 'sq', label: 'Shqip' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'sq',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./data/fredi.db',
    },
  }),
  sharp,
  plugins: [],
})
