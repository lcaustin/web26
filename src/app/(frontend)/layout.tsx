import type { Metadata } from 'next'
import Script from 'next/script'
import React from 'react'

import './globals.css'

const siteUrl = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://2026.lcaustin.org')

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "어스틴 주님의교회 · Lord's Church of Austin",
    template: "%s | 어스틴 주님의교회",
  },
  description:
    "예배의 감격으로 변화받아 열방을 섬기는 교회 — Transformed by the Spirit of Worship to Serve the Nations",
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: "Lord's Church of Austin · 어스틴 주님의교회",
    title: "어스틴 주님의교회 · Lord's Church of Austin",
    description: '예배의 감격으로 변화받아 열방을 섬기는 교회',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: 'https://static.lcaustin.org/favicon.ico',
    apple: 'https://lcaustin.org/_next/static/images/favicon-74192dcc96a0c6c4f823c87e34813c3e.png',
  },
}

// Inline script that runs before paint, so the correct theme is applied
// immediately (no flash of the wrong theme). Defaults to light, but respects
// a stored preference from a previous visit.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('lc-theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="site" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
