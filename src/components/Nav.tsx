'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type NavChild = { ko: string; en: string; href: string; external?: boolean }
type NavLink = { ko: string; en: string; href: string; children?: NavChild[] }

const NAV_LINKS: NavLink[] = [
  {
    ko: '교회안내', en: 'About', href: '#',
    children: [
      { ko: '소개', en: 'Introduction', href: '/introduction' },
      { ko: '주보', en: 'Bulletin', href: '/jubo' },
      { ko: '예배안내', en: 'Service Hours', href: '/service-hours' },
      { ko: '섬기는이', en: 'Our Staff', href: '/staff' },
    ],
  },
  {
    ko: '말씀&찬양', en: 'Sermon & Worship', href: '#',
    children: [
      { ko: '주일설교', en: 'Sunday Sermon', href: '/sermons' },
      { ko: '매일말씀묵상', en: 'Daily Devotion', href: 'https://lcaustin.org/dailyqt', external: true },
      { ko: '예배실황', en: 'Worship Live', href: 'https://lcaustin.org/video/worship', external: true },
      { ko: '성가대', en: 'Choir', href: 'https://lcaustin.org/video/choir', external: true },
    ],
  },
  {
    ko: '훈련&사역', en: 'Training & Ministry', href: '#',
    children: [
      { ko: '커피브레이크', en: 'Coffee Break', href: '#' },
      { ko: '신구약 맥잡기', en: 'Bible Panorama', href: '#' },
      { ko: '크라운 재정교실', en: 'Crown Finance', href: '#' },
      { ko: '가온토요학교', en: 'Gaon School', href: '/departments/gaonschool' },
    ],
  },
  {
    ko: '부서', en: 'Departments', href: '/departments',
    children: [
      { ko: '영아부', en: 'Nursery', href: '/departments/nursery' },
      { ko: '유아부', en: 'Preschool', href: '/departments/preschool' },
      { ko: '초등부', en: 'Elementary', href: '/departments/elementary' },
      { ko: '중고등부', en: 'Youth', href: '/departments/youth' },
      { ko: '대학부', en: 'College', href: '/departments/youngadult' },
      { ko: '청년부', en: 'Young Adult', href: '/departments/youngadult' },
      { ko: '에노스', en: 'Enos', href: '/departments/enos' },
    ],
  },
  {
    ko: '미디어', en: 'Media', href: '#',
    children: [
      { ko: '사진', en: 'Photos', href: '#' },
      { ko: '영상', en: 'Videos', href: '#' },
      { ko: 'LC News', en: 'LC News', href: '#' },
    ],
  },
  { ko: '소식', en: 'News', href: '/news' },
]

export default function Nav() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState<string | null>(null)
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    if (current === 'light' || current === 'dark') setTheme(current)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('lc-theme', next) } catch { /* ignore */ }
  }

  const handleMouseEnter = (ko: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setDesktopOpen(ko)
  }

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setDesktopOpen(null), 120)
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
          <div style={{ width: 36, height: 36, borderRadius: 6, background: '#5C1E2E', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#D4A93C' }}>
            LC
          </div>
          <div className="nav-name">
            <div className="ko">주님의교회</div>
            <div className="en">LORD&apos;S CHURCH OF AUSTIN</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <div
              key={link.ko}
              className="nav-item"
              onMouseEnter={() => link.children ? handleMouseEnter(link.ko) : undefined}
              onMouseLeave={link.children ? handleMouseLeave : undefined}
            >
              <a href={link.href} className="nav-top-link">
                <span className="nav-top-link-ko-row">
                  <span className="lko">{link.ko}</span>
                  {link.children && <i className="ti ti-chevron-down nav-caret" aria-hidden="true" />}
                </span>
                <span className="len">{link.en}</span>
              </a>

              {link.children && desktopOpen === link.ko && (
                <div
                  className="nav-dropdown"
                  onMouseEnter={() => handleMouseEnter(link.ko)}
                  onMouseLeave={handleMouseLeave}
                >
                  {link.children.map((child) => (
                    <a
                      key={child.ko}
                      href={child.href}
                      className="nav-dropdown-item"
                      {...(child.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <span className="nav-dd-ko">{child.ko}</span>
                      <span className="nav-dd-en">{child.en}</span>
                      {child.external && <i className="ti ti-external-link nav-dd-ext" aria-hidden="true" />}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="nav-right">
          <button type="button" className="theme-btn" onClick={toggleTheme} aria-label="Toggle dark/light mode">
            <i className={`ti ${theme === 'dark' ? 'ti-moon' : 'ti-sun'}`} aria-hidden="true" />
          </button>
          <button type="button" className="burger-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Open menu">
            <i className={`ti ${menuOpen ? 'ti-x' : 'ti-menu-2'}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <div key={link.ko}>
            {link.children ? (
              <>
                <button
                  type="button"
                  className="mobile-menu-parent"
                  onClick={() => setMobileOpen(mobileOpen === link.ko ? null : link.ko)}
                >
                  <span className="mobile-menu-parent-label">
                    <span className="mobile-ko">{link.ko}</span>
                    <span className="mobile-en">{link.en}</span>
                  </span>
                  <i className={`ti ${mobileOpen === link.ko ? 'ti-chevron-up' : 'ti-chevron-down'}`} aria-hidden="true" />
                </button>
                <div className={`mobile-submenu${mobileOpen === link.ko ? ' open' : ''}`}>
                  {link.children.map((child) => (
                    <a
                      key={child.ko}
                      href={child.href}
                      className="mobile-submenu-item"
                      onClick={() => setMenuOpen(false)}
                      {...(child.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <span className="mobile-ko">{child.ko}</span>
                      <span className="mobile-en">{child.en}</span>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <a href={link.href} className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                <span className="mobile-ko">{link.ko}</span>
                <span className="mobile-en">{link.en}</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
