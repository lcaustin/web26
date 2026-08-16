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
- Requested semester status changes to propagate to all linked Bible Study groups.
- Requested an Active/Inactive semester flag to control public visibility, with current semesters active.
- Asked whether any existing Bible Study record has a Custom Course Title value.
- Reported that the Active flag was not visible in the admin.
- Added a TODO item for a Room booking system and calendar, with an initial list of church rooms and spaces.
- Confirmed the room booking workflow: one-time date selection, one open request per requester, admin email/approval/rejection, requester notifications, and status-filtered admin list.
- Requested time-picker controls for room booking on the frontend and admin, and a Room Booking entry in Quick Links.
- Requested that the public booking calendar show only approved reservations and display only each reservation's purpose to visitors.
- Requested changing the Korean room booking label from 공간 예약 to 장소 예약.
- Requested sample room reservation data for July 2026.
- Reported that the Room Booking page was not styled correctly.
- Requested a monthly calendar view with approved booking purposes shown on each day, while keeping repeatable reservations admin-only.
- Requested Cloudflare Turnstile protection for the public room reservation form to prevent spam submissions.
- Clarified that the existing Turnstile configuration used by Bible Study signup should be reused for room reservations.
- Requested clear success/failure feedback when a room reservation overlaps an existing reservation on the same day and room.
- Requested calendar events to show purpose, start–end time, and room label.
- Reported that identical Korean and English room labels displayed as duplicates, such as Room 101 · Room 101.
- Asked whether SMTP is already used and requested that the reservation notification email be changeable.
- Requested a recipient email field with Save control at the top of the admin room reservations list.
- Clarified that the reservation recipient email should remain configurable only in Site Settings, not on the reservation list page.
- Reported a build failure from a stale Payload admin import-map reference to the removed ReservationEmailControl component.
- Repeatedly reported Payload rejecting the selected Room relationship as invalid even though the admin field is a dropdown.
- Reported a successful reservation submission causing a React null currentTarget error when resetting the form asynchronously.
- Requested showing the reservation purpose in the admin reservation list.
- Requested approval emails with a no-login approval link, standardized Date/Time formatting, and a confirmation summary modal before reservation submission.
- Clarified that a requester may submit another reservation once their existing reservation date has passed.
- Reported reservation deletion failing with an undefined document ID error from the post-change email hook.
- Reported that reservation deletion still failed after the initial deleted-document guard.
- Found that reservation deletion returned HTTP 405 because the public `/api/room-reservations` route shadowed Payload's collection DELETE endpoint.
- Reported malformed SMTP sender formatting showing `LC Austin>` instead of a properly bracketed display name.
- Requested the Bible Study card to show `줌미팅 · Zoom` when location is empty.
- Requested showing Bible Study capacity in the card’s top-right corner as `정원 · Capacity: 10`.
- Requested reducing mobile page side margins to 16px on each side.
- Requested a weekly view option alongside the monthly booking calendar.
- Requested automatic light/dark theme switching based on sunset and sunrise.
- Clarified that automatic theme switching must use the visitor's local browser time.
- Requested the automatic light-mode window be 8:00 AM through 8:00 PM local time.
- Requested larger previous/next navigation buttons in the monthly and weekly booking calendar.
- Requested replacing the browser confirmation prompt with a better styled reservation confirmation modal.
- Requested changing reservation Purpose from textarea to a required input with placeholder `예) 행복구역 구역모임`.
- Production Introduction seeding was blocked by a stale missing media relation; changed page lookups to depth 0 so missing media cannot cause a 404.
- Requested a slight font-size increase in the `.senior-pastor` container.
- Requested removing the one-open-reservation-per-requester restriction so users can submit multiple reservations.
- Confirmed the Bible Study signup system and Room Booking system are complete; continue with Photo · Google Drive.
- Requested that photos under `<year>/NO_ALBUM` use each filename as the visible photo title instead of displaying `NO_ALBUM` as an album name.
- Approved using option #1: five-minute Next.js ISR caching for the landing page on Vercel.
- Approved implementing caching option #7: homepage-focused database indexes.
- Requested alternating background colors for Next Generation landing-page tiles.
- Requested creation of 2026 Fall Bible Study groups from the supplied leader, schedule, course, and target-group list.
- Requested that active Bible Study cards remain visible even when registration status is closed.
- Requested identical card/table visibility rules: Bible Study active status true and semester active status true.
- Requested sort-order editing support on the Bible Study Semesters admin page.
- Requested drag-and-drop semester ordering in the Bible Study Semesters admin page.
- Clarified that sorting should apply to individual Bible Study records, not semester records.
- Requested a semester dropdown for Bible Study ordering, defaulting to the latest semester.
- Clarified that Bible Study ordering belongs on each Semester detail page, such as `/admin/collections/bible-study-semesters/3`.
- Requested the semester Bible Study ordering control use a list layout and save changes only on the Save button.
- Requested the Bible Study ordering list appear at the bottom of the Semester detail page.
- Requested removal of the semester-level order field; ordering is only needed for groups within each semester.
- Requested a semester dropdown filter on the main Bible Studies admin list page.
- Requested the Bible Studies admin semester filter default to the latest semester.
- Requested proper padding and spacing for the Bible Study sort control.
- Requested the `학기 · Semester` dropdown be placed and styled properly on the Bible Studies admin list.
- Clarified that the semester dropdown should sit directly above `.search-bar`.
- Corrected placement: the semester dropdown should sit directly below `.search-bar`.
- Requested CSV export respect the selected semester dropdown filter.
- Requested reorder-control padding match the other Payload admin containers.
- Clarified that the reorder panel should use the same horizontal admin gutter space.
- Requested using Payload’s `.gutter` class to match the admin spacing precisely.
- Reported zero order numbers and missing gutter after the `.gutter` change; requested both be corrected.
- Requested the Save Order button move to the top-right of the reorder section.
- Clarified that displayed order numbers must remain fixed while dragging and update only after Save.
- Requested new Bible Study records receive and preserve an order within their selected semester for later Save Order sorting.
- Requested displayed Bible Study order numbers remain unchanged until the Save button is pressed.
- Reported that the public Bible Studies page was not respecting saved group order.
- Clarified that the summary list above the cards must use the same within-group order as the cards.
