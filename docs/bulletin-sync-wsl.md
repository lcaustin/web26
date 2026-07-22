# Weekly bulletin News sync (WSL)

The public bulletin PDF is uploaded through Payload Admin. This job then downloads every 2026-and-newer bulletin that has no linked News records, OCRs its announcements column, and imports the announcements into News.

It is intentionally run outside Vercel: OCR requires local binaries.

## One-time WSL setup

From the checked-out `web26` directory:

```bash
sudo apt update
sudo apt install -y poppler-utils tesseract-ocr tesseract-ocr-kor imagemagick
pnpm install --frozen-lockfile
```

Create `.env` with the production values needed by the script:

```dotenv
DATABASE_URI=postgresql://...
R2_PUBLIC_URL=https://pub-2f2b09ce26ca48ca9b726870a49512c2.r2.dev
```

Preview the work without changing the database:

```bash
pnpm tsx scripts/import-all-2026-bulletin-news.ts --dry-run
```

Run the import:

```bash
pnpm sync:bulletin-news
```

## Schedule: Saturday 9:00 PM Central

On a Linux machine with cron running, first run `command -v pnpm` and use that absolute path below. Then add this with `crontab -e` and replace the repository path:

```cron
CRON_TZ=America/Chicago
0 21 * * 6 cd /home/YOUR_USER/Code/LC/web26 && /home/YOUR_USER/.local/share/pnpm/pnpm sync:bulletin-news >> /home/YOUR_USER/bulletin-sync.log 2>&1
```

`CRON_TZ=America/Chicago` keeps the run at 9:00 PM through both CDT and CST.

For a typical WSL installation, Windows Task Scheduler is more reliable because WSL and its cron service may stop when Windows sleeps. Create a weekly task for Saturday at 9:00 PM using your Windows local time, with this program:

```text
C:\\Windows\\System32\\wsl.exe
```

and arguments (replace the distribution and path):

```text
-d Ubuntu -- bash -lc "cd /home/YOUR_USER/Code/LC/web26 && pnpm sync:bulletin-news >> /home/YOUR_USER/bulletin-sync.log 2>&1"
```

## Notes

- Upload the bulletin PDF and set its Sunday issue date in Payload Admin before the job runs.
- The sync is idempotent: bulletins that already have linked News records are skipped.
- The job requires `pdftoppm`, ImageMagick, and Korean Tesseract language data; all are installed in the one-time setup step above.
