import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-kr)', 'Noto Sans KR', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-alt': 'var(--bg-alt)',
        surf: 'var(--surf)',
        'nav-bg': 'var(--nav-bg)',
        'nav-bdr': 'var(--nav-bdr)',
        t1: 'var(--t1)',
        t2: 'var(--t2)',
        t3: 'var(--t3)',
        bdr: 'var(--bdr)',
        bdr2: 'var(--bdr2)',
        gld: 'var(--gld)',
        link: 'var(--link)',
        burgundy: '#5C1E2E',
      },
    },
  },
  plugins: [],
}

export default config
