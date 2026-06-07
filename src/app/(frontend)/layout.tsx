import type { Metadata } from 'next'
import React from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: "Lord's Church of Austin · 어스틴 주님의교회",
  description:
    "예배의 감격으로 변화받아 열방을 섬기는 교회 — Transformed by the Spirit of Worship to Serve the Nations",
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
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="site" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
