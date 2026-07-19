'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import AuroraText from './AuroraText'

type NavChild = { ko: string; en: string; href: string; external?: boolean }
type NavLink = { ko: string; en: string; href: string; children?: NavChild[] }

const NAV_LINKS: NavLink[] = [
  {
    ko: '교회안내', en: 'About', href: '#',
    children: [
      { ko: '소개', en: 'Introduction', href: '/introduction' },
      { ko: '예배안내', en: 'Service Hours', href: '/service-hours' },
      { ko: '섬기는이', en: 'Our Staff', href: '/staff' },
      { ko: '연혁', en: 'History', href: '/history' },
    ],
  },
  {
    ko: '말씀&찬양', en: 'Sermon & Worship', href: '#',
    children: [
      { ko: '주일설교', en: 'Sunday Sermon', href: '/sermons' },
      { ko: '매일말씀묵상', en: 'Daily Devotion', href: '/videos/daily-devotion' },
      { ko: '예배실황', en: 'Worship Live', href: '/videos/worship' },
      { ko: '성가대', en: 'Choir', href: '/videos/choir' },
    ],
  },
  {
    ko: '훈련&사역', en: 'Training & Ministry', href: '#',
    children: [
      { ko: '커피브레이크', en: 'Coffee Break', href: '/coffeebreak' },
      { ko: '신구약 맥잡기', en: 'Bible Panorama', href: '/biblepanorama' },
      { ko: '크라운 재정교실', en: 'Crown Finance', href: '/crown-finance' },
      { ko: '선교지', en: 'Mission', href: '/mission' },
    ],
  },
  {
    ko: '다음세대', en: 'Next Generation', href: '/departments',
    children: [
      { ko: '영아부', en: 'Nursery', href: '/departments/nursery' },
      { ko: '유아부', en: 'Preschool', href: '/departments/preschool' },
      { ko: '초등부', en: 'Elementary', href: '/departments/elementary' },
      { ko: '중고등부', en: 'Youth', href: '/departments/youth' },
      { ko: '대학청년부', en: 'College & Young Adult', href: '/departments/youngadult' },
      { ko: '영어예배부', en: 'English Ministry', href: '/departments/englishministry' },
      { ko: '에노스', en: 'Enos', href: '/departments/enos' },
      { ko: '가온토요학교', en: 'Gaon School', href: '/gaonschool' },
    ],
  },
  {
    ko: '미디어', en: 'Media', href: '#',
    children: [
      { ko: '사진', en: 'Photos', href: '/photos' },
      { ko: '영상', en: 'Videos', href: '/videos' },
    ],
  },
  {
    ko: '소식', en: 'News', href: '/news',
    children: [
      { ko: '교회소식', en: 'Church News', href: '/news' },
      { ko: '주보', en: 'Bulletin', href: '/bulletin' },
    ],
  },
]

// Shown only when this page is loaded inside the native mobile app's iframe
// (flagged via ?lc_app=1, see mobile/src/screens/HomeScreen.tsx). Clicking
// these posts a message up to the native shell, which has its own React
// Router and renders Account/Notifications as native screens — they aren't
// real pages on this site, so we navigate via postMessage instead of href.
const APP_LINKS = [
  { ko: '알림 설정', en: 'Notifications', path: '/notifications' },
  { ko: '내 계정', en: 'Account', path: '/account' },
]

export default function Nav() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState<string | null>(null)
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null)
  const [isNativeApp, setIsNativeApp] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    if (current === 'light' || current === 'dark') setTheme(current)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsNativeApp(params.get('lc_app') === '1')
    // The native app's back arrow on Account/Notifications sends users back
    // here with ?open_menu=1 so they land with this menu already open,
    // instead of a closed Home screen.
    if (params.get('open_menu') === '1') setMenuOpen(true)
    // Sync the native app's persisted theme into the website so both always
    // match — the native shell saves it to Capacitor Preferences (survives
    // app restarts) and passes it here on every webview load via ?lc_theme=.
    const nativeTheme = params.get('lc_theme')
    if (nativeTheme === 'dark' || nativeTheme === 'light') {
      setTheme(nativeTheme)
      document.documentElement.setAttribute('data-theme', nativeTheme)
      try { localStorage.setItem('lc-theme', nativeTheme) } catch { /* ignore */ }
    }
  }, [])

  const navigateNative = (path: string) => {
    setMenuOpen(false)
    window.parent?.postMessage({ type: 'lc-native-navigate', path }, '*')
  }

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
            src="/lc-logo.svg"
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
            <img
              src={theme === 'dark' ? '/logo-text-lcaustin-white.svg' : '/logo-text-lcaustin-black.svg'}
              alt=""
              aria-hidden="true"
              className="nav-name-logo"
            />
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

        {isNativeApp && (
          <div className="mobile-menu-app-section">
            {APP_LINKS.map((link) => (
              <button
                key={link.path}
                type="button"
                className="mobile-menu-link mobile-menu-app-link"
                onClick={() => navigateNative(link.path)}
              >
                <span className="mobile-ko">{link.ko}</span>
                <span className="mobile-en">{link.en}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
