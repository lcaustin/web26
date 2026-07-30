# LC Austin Website Project Prompt Log

This file summarizes the project requests made before prompt-by-prompt logging began. Future user prompts will be appended below with their date. Outcomes, implementation details, and results are not logged.

## Project setup and deployment

- Rebuild the LC Austin church website as a Capacitor hybrid app and deploy the 2026 site.
- Commit and push changes to the web and mobile repositories.
- Configure Vercel, Neon/Postgres, Payload CMS, Cloudflare R2, and production domains.
- Troubleshoot MongoDB package conflicts, Rclone configuration, R2 credentials, public development URLs, and deployment errors.
- Migrate DigitalOcean assets and image files to Cloudflare R2.

## Payload CMS and migrations

- Build Payload collections and admin workflows for bulletins, videos, news, photos, staff, departments, service hours, pages, Bible Studies, semesters, course types, signups, and media.
- Migrate legacy MongoDB exports and PDF bulletin data into PostgreSQL.
- Add and repair Payload migrations, indexes, relationships, admin permissions, and production-safe database changes.
- Add admin CSV exports, bulk operations, semester duplication, and managed course types.

## Website pages and UX

- Rebuild and refine sermons, videos, photos, news, bulletins, departments, mission, training, registration, service hours, staff, and Bible Studies pages.
- Add pagination, mobile “Show more” behavior, category filters, search, lightbox galleries, responsive breakpoints, card layouts, and accessibility improvements.
- Improve hero typography, Aurora text effects, video playback, dynamic daily devotion/sermon links, metadata, SEO, and navigation.
- Move and rename menus, hide LC News temporarily, add Quick Links, and update ministry labels.

## Media and automation

- Configure Cloudflare R2 storage for static assets, bulletins, and Payload media uploads.
- Add YouTube synchronization, Vercel cron scheduling, PDF bulletin/news importing, duplicate handling, and Google Drive photo batch processing plans.
- Add Cloudflare Turnstile protection to Bible Study signup forms.

## Authentication and notifications

- Configure admin flags, Google/mobile authentication, account deletion, device tokens, notification preferences, and forgot-password email through Gmail SMTP.

## Bible Studies

- Add group-level `before`, `open`, and `closed` signup statuses with capacity handling.
- Add signup forms, phone formatting, CSV exports, 100-record admin pagination, sample-data seed scripts, semester management, semester duplication, managed course types, optional fields, and optional Coffee Break subjects.
- Ensure cards display `Semester · Course Name · Subject · Group` and support dynamic categories such as `newlife`.

## Current prompt log

### 2026-07-30

- Requested a summarized prompt history to be saved and future prompts to be logged in this file.
- Clarified that only prompts should be saved; outcomes should not be recorded.
- Specified that this log should be saved in the `web26` project directory.
- Requested a compact responsive table view above the Bible Study signup cards.
- Requested one line per table row and combining the first two table columns.
- Requested removing status and signup count from the table.
- Requested showing only the capacity number on each study card.
- Requested a separate Semester column in the summary table.
- Requested Leader remain visible at all sizes and Semester hide on small screens.
- Requested Schedule remain visible at all sizes and the Course · Subject · Group column use less small-screen space.
- Requested the summary table never scroll horizontally at any screen size.
- Requested removing the extra table column after Leader.
- Requested showing status in the final table column.
- Requested Korean-only status text in the table.
- Requested hiding the status column.
- Requested automatic table cell widths based on text content.
