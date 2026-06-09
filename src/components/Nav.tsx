'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { ko: '교회소개', en: 'About', href: '#' },
  { ko: '말씀', en: 'Sermons', href: '#' },
  { ko: '사역', en: 'Ministry', href: '#' },
  { ko: '다음세대', en: 'Next Gen', href: '/departments' },
  { ko: '소식', en: 'News', href: '/news' },
]

export default function Nav() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [menuOpen, setMenuOpen] = useState(false)

  // Sync local state with whatever the inline init-script already set on <html>
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    if (current === 'light' || current === 'dark') setTheme(current)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('lc-theme', next)
    } catch {
      // ignore (e.g. private browsing)
    }
  }

  return (
    <nav>
      <div className="wrap nav-inner">
        <Link href="/" className="nav-brand">
          <img
            src="https://lcaustin.org/_next/static/images/LC_logo-d577ea457c18198a982159ad30c9babf.svg"
            alt="Lord's Church of Austin logo"
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement | null
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: '#5C1E2E',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#D4A93C',
            }}
          >
            LC
          </div>
          <div className="nav-name">
            <div className="ko">주님의교회</div>
            <div className="en">LORD&apos;S CHURCH OF AUSTIN</div>
          </div>
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.ko} href={link.href}>
              <span className="lko">{link.ko}</span>
              <span className="len">{link.en}</span>
            </a>
          ))}
        </div>

        <div className="nav-right">
          <button
            type="button"
            className="theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
          >
            <i className={`ti ${theme === 'dark' ? 'ti-moon' : 'ti-sun'}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="burger-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
          >
            <i className={`ti ${menuOpen ? 'ti-x' : 'ti-menu-2'}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a key={link.ko} href={link.href} onClick={() => setMenuOpen(false)}>
            <span>{link.ko}</span>
            <span className="men">{link.en}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
