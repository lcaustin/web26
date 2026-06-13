# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev           # Start dev server (Next.js + Payload CMS)
pnpm devsafe       # Clear .next cache and start dev server
pnpm build         # Production build
pnpm start         # Start production server
pnpm lint          # ESLint
pnpm generate:types  # Regenerate Payload TypeScript types (run after schema changes)
```

## Project Overview

This is the **new church website** for Lord's Church of Austin, replacing a previous website. The project scope includes:

1. **Church website** — public-facing site with sermons, news, departments, and bilingual content
2. **Migration tooling** — scripts and API routes under `src/app/api/` for importing content from the previous website
3. **Proclaim slide generation** — auto-generation of church presentation slides for [Proclaim](https://proclaimonline.com/) (worship/announcement slide software)

## Architecture

**Lord's Church of Austin** — a bilingual (Korean/English) church website built with Next.js App Router and Payload CMS as the headless backend.

### Routing layout

- `src/app/(frontend)/` — Public-facing website (landing page, news, departments, static pages)
- `src/app/(payload)/admin/` — Payload CMS admin dashboard
- `src/app/api/` — Utility/seeding endpoints (development only, guarded in production)

### Data layer (Payload CMS)

Payload runs on **PostgreSQL via Neon**. Collections and globals are defined in:

- `src/collections/` — Content schemas: Users, Media, Pages, News, Sermons, ServiceTimes, Departments, QuickLinks
- `src/globals/` — Site-wide settings (SiteSettings: welcome banner, church info)
- `src/payload.config.ts` — Central Payload configuration

After any schema change, run `pnpm generate:types` to update `src/payload-types.ts`.

Server components fetch data using `getPayload()` directly (Node.js API, not HTTP), typically with `Promise.all()` for parallel queries.

### Bilingual content pattern

Content is bilingual Korean/English using a custom field helper (`src/fields/bilingual.ts`) that creates `{ ko, en }` object fields. This is **not** Payload's built-in locale system — both languages are stored as sibling fields and rendered side-by-side. Korean is the primary language in the admin UI.

### Styling

Tailwind CSS with custom CSS variables for theming (defined in `tailwind.config.ts`). Dark mode uses `data-theme="dark"` on the root element. Theme persists to `localStorage` under key `lc-theme`. An inline script in the root layout prevents flash-of-wrong-theme on load.

Custom Tailwind tokens: `bg`, `bg-alt`, `nav-bg`, and various text color variables.

### Path aliases

- `@/*` → `src/*`
- `@payload-config` → `src/payload.config.ts`
