# Lord's Church of Austin 2026 rebuild — project history

This is a durable handoff record of the rebuild conversation and implementation decisions. It intentionally excludes credentials, API keys, database URLs, access tokens, and other secrets.

## Project

- Repository: `web26`
- Public site: `https://2026.lcaustin.org` (planned to become `https://lcaustin.org`)
- Legacy site: `https://lcaustin.org`
- Stack: Next.js, Payload CMS 3, PostgreSQL/Neon, Cloudflare R2, Vercel, Capacitor mobile app.
- Primary language: Korean with English support throughout the public site and Payload admin.

## Storage and deployment

- Existing DigitalOcean static files were migrated to the Cloudflare R2 bucket `lcaustin-assets`.
- R2 serves the public static-asset base through `R2_PUBLIC_URL`.
- The bucket is used for bulletins and other static assets, not just PDFs.
- R2's public development URL was used initially. A custom domain requires Cloudflare-managed DNS; transferring domain registration is not required.
- The Vercel production deployment uses the production Neon database. Confirm the intended database host before running migrations.
- Payload upload access requires the correct deployed `NEXT_PUBLIC_SERVER_URL` and R2 CORS allows the production and localhost origins.

## Core CMS/content work completed

### Bulletins and News

- Added a Payload `bulletins` collection and public `/bulletin` archive.
- Admin uploads PDF bulletins to R2.
- Bulletin archive renders five items per page on both desktop and mobile; the mobile/Show more behavior appends items.
- Bulletin PDFs are imported into the `news` collection through the bulletin importer and an upload after-hook.
- Duplicate News titles are skipped during import.
- Imported News omits unwanted categories such as `교인동정`, `환영`, and `감사`.
- News supports create/update/delete in Payload admin.
- News has bilingual title handling: an admin title formatted as `Korean / English` is split into `title_ko` and `title_en`.
- Added News category identification from title/content and category labels in the public UI.
- News cards display the category as a pill in the top-right corner.
- News list includes search, category filters, responsive paging, and mobile Show more behavior.

### Videos, sermons, and YouTube sync

- Legacy video data was migrated into one `videos` collection.
- Categories use English identifiers, including `sermon`, `daily-devotion`, `worship`, `choir`, `offering-song`, `ministry`, and `other`.
- `special-music` was renamed to `offering-song`.
- Sermons are classified by titles containing `설교`.
- Video titles with a leading ISO date use that date as the air date rather than the YouTube upload timestamp.
- English sermon titles are pulled from the description after `/` for legacy Sunday-sermon entries.
- Video cards use centered transparent circular play controls with stronger border, icon, and shadow contrast.
- Video archives use page numbers on desktop and appended Show more on mobile.
- Responsive search/category/filter behavior was applied to Photos, Videos, and News.
- The YouTube sync imports the most recent ten videos per configured channel.
- Unicode normalization is applied before Korean title classification, because some YouTube titles use decomposed Hangul. This ensures `매일말씀묵상` videos are categorized correctly.
- The sync now updates an existing YouTube record by `(source, video_id)` before inserting. It remains operational even if the historical unique index is missing.
- A migration exists to restore the desired unique index: `videos(source, video_id)`.

### Homepage Hero

- Hero title/tagline, button labels, button links, background YouTube IDs, and site messaging are editable in Site Settings.
- Manual Hero button labels/links override automatic behavior when populated.
- The Hero background rotates through configured YouTube videos in a randomized order per page load, moving to the next video at the end.
- Hero typography includes word-reveal animation and selectively colored aurora treatment for `예배`, `감격`, `변화`, `열방`, and `교회`.
- Aurora colors are shuffled per Hero load while preserving accessible static text for screen readers and SEO.
- Hero action-button schedule is calculated in `America/Chicago`:
  - Weekdays, 5:00 AM–1:59 PM: today's Daily Devotion, when a record dated today exists.
  - Weekdays after 2:00 PM and weekends: latest Sunday sermon.
  - If today's devotion is absent, it safely falls back to the Sunday sermon.

### Other public pages

- Implemented/updated: Service Hours, Staff, Church History, Training & Ministry pages, Mission, Offering, Registration, Departments, Photos, Videos, News, Bulletin, and related navigation.
- `대학부` and `청년부` are combined as `대학청년부` in relevant content/navigation.
- Added `가온학교` service-hours content.
- Staff preserves legacy grouping/order, includes senior-pastor details and group image, has desktop front/back hover and mobile front/back toggle behavior.
- Photo albums use R2 images, sort by event date, support category search, responsive grids, album detail pages, and a modal gallery with thumbnails/navigation.
- Department pages use richer layout, banner overlays, English sections below Korean content, and YouTube content where configured.
- Quick Links were audited; legacy `_next/static` image references were migrated or replaced with R2 assets.
- LC News remains hidden as a navigation item; it is a legacy video category, not the CMS News system.

## Admin and database

- Payload admin is available at `/admin`.
- Content used for generic Training/Ministry/Mission pages is stored under Payload Pages.
- A previous `/api/bulletins` custom GET route shadowed Payload's REST POST endpoint and caused admin create HTTP 405. It was moved to `/api/bulletin-archive`, restoring Payload bulletin uploads.
- A prior `service-times` admin title error was fixed by supplying a scalar admin title instead of a bilingual object.
- Migration history must be applied to the same production Neon database that Vercel uses.
- Use `pnpm payload migrate` only with a verified production `DATABASE_URI`; review prompts before proceeding.

## Scheduled jobs and batch processes

### Vercel: YouTube sync

- Route: `/api/cron/youtube-sync`
- Current Vercel schedule: `10 10 * * *` (10:10 UTC; 5:10 AM Central during daylight saving time).
- Requires `CRON_SECRET`, `YOUTUBE_API_KEY`, and `DATABASE_URI` in Vercel Production.
- Manual trigger form:

  ```bash
  curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
    https://2026.lcaustin.org/api/cron/youtube-sync
  ```

- If a Daily Devotion is uploaded after the daily cron execution, run the manual trigger or choose a more frequent schedule.

### WSL: bulletin PDF to News

- Bulletin sync is intentionally not a Vercel Cron job because PDF parsing/OCR may require Poppler, Tesseract Korean language data, and ImageMagick.
- Script:

  ```bash
  pnpm sync:bulletin-news
  ```

- It scans 2026 bulletins and skips ones already linked to News records.
- Suggested WSL Linux cron: Saturday 9:00 PM local time:

  ```cron
  0 21 * * 6 cd /home/YOUR_USER/Code/LC/web26 && /home/YOUR_USER/.local/share/pnpm/pnpm sync:bulletin-news >> /home/YOUR_USER/bulletin-sync.log 2>&1
  ```

- On Windows + WSL, Windows Task Scheduler is generally more reliable than a WSL cron daemon if the PC can sleep. See `docs/bulletin-sync-wsl.md`.

### WSL: Google Drive photo batch

- The photo batch watches the Windows-mounted shared-drive path, for example `/mnt/g/Shared drives/HomepagePhoto`.
- It processes folder trees such as `UPLOAD/교육부/2026/VBS`.
- It resizes images for web use, moves originals to `RAW`, puts processed copies under `RESIZED`, uploads them to R2, and creates Photo records using the relevant folder/category data.
- See `docs/photo-drive-batch.md`.

## Important operational lessons

- Do not expose or commit R2 keys, Neon URIs, Google/YouTube keys, `CRON_SECRET`, or Vercel tokens.
- Vercel CLI may show protected variables as blank when the local CLI credential cannot decrypt them; that does not necessarily mean the deployed runtime is missing them.
- A 401 on the cron route means `CRON_SECRET` does not match the deployed runtime value.
- A generic YouTube sync 500 should be checked through Vercel logs. Past causes included a missing database unique index and Unicode-normalization mismatch in YouTube title categorization.
- The PostgreSQL SSL warning about `sslmode=require` is a future-driver warning, not the original sync failure. Changing the URI to `sslmode=verify-full` preserves the currently secure behavior when appropriate for the database provider.
- Generated `tsconfig.tsbuildinfo` is tracked in this repository and may change after TypeScript checks.

## Recent commits around the current state

- `13610b6` — Improve video play button contrast
- `469da25` — Make YouTube sync resilient to missing index
- `e89b554` — Normalize YouTube titles before categorizing
- `e74b716` — Schedule homepage devotion button by church time
- `a2fc337` — Update completed SEO checklist

## Useful commands

```bash
# Type check
pnpm exec tsc --noEmit

# Apply Payload migrations to the database configured by DATABASE_URI
pnpm payload migrate

# Import all unlinked 2026 bulletin PDFs into News
pnpm sync:bulletin-news

# Import recent YouTube videos (requires DATABASE_URI and YOUTUBE_API_KEY)
pnpm sync:youtube
```

