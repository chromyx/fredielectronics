import React from 'react'
import './styles.css'
import './pages.css'

export const metadata = {
  title: 'Fredi Electronics – Integrues sistemesh që nga 1991',
  description:
    'Ekrane LED, audio-video, sisteme konference, siguri dhe energji në Shqipëri dhe Kosovë. LED displays, AV, conference, security and power since 1991.',
  icons: { icon: '/favicon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions (dark mode, translators…) add attributes to <html>/<body> before React loads.
    <html lang="sq" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100,500..800&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
