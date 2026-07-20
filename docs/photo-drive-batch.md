# Daily Google Drive photo batch (WSL)

This batch works with the Google Drive for desktop folder already synced to Windows. It does not use a Google Drive API or any Google credentials.

Inside the synced parent folder, create these folders:

```text
Church Photos/
  UPLOAD/       # photographers add originals by category and album
  RESIZED/      # generated WebP copies, synced back to Drive
  RAW/          # untouched originals after a successful upload
```

The first folder under `UPLOAD` is the website category and the second folder must be a four-digit year. Any remaining folder path is the album. For example, `UPLOAD/교육부/2026/VBS/team.jpg` becomes `RESIZED/교육부/2026/VBS/team.webp`, uploads to `uploads/photos/교육부/2026/VBS/team.webp` in R2, creates or updates the **2026 VBS** photo album tagged **교육부**, and moves the original to `RAW/교육부/2026/VBS/team.jpg`. The album date uses the folder year, so albums sort correctly even when old images are uploaded later.

Images must be placed under `UPLOAD/<category>/<year>/...`; anything outside that format is rejected so it cannot be miscategorized or sorted incorrectly.

## One-time WSL setup

Install Node.js 20+, pnpm, and rclone in WSL. Clone this repository in the WSL filesystem, then run:

```bash
cd ~/web26
corepack enable
pnpm install --frozen-lockfile
rclone config
```

Configure rclone's `r2` remote with the existing Cloudflare R2 credentials. Then create `~/.config/lcaustin-photo-batch.env` with your real Windows-sync location:

```bash
export PHOTO_BATCH_ROOT='/mnt/c/Users/YOUR_WINDOWS_USER/Google Drive/Church Photos'
export R2_PHOTO_REMOTE='r2:lcaustin-assets/uploads/photos'
export DATABASE_URI='postgresql://...'
export PHOTO_MAX_WIDTH=1920
export PHOTO_WEBP_QUALITY=84
```

Keep this file private (`chmod 600 ~/.config/lcaustin-photo-batch.env`). It contains no Google credential, but the rclone configuration contains the R2 secret and must also remain private.

Preview the work before the first actual run:

```bash
cd ~/web26
source ~/.config/lcaustin-photo-batch.env
PHOTO_DRY_RUN=true pnpm sync:drive-photos
```

Then run it for real:

```bash
source ~/.config/lcaustin-photo-batch.env
pnpm sync:drive-photos
```

## Daily schedule

Open the WSL user's crontab with `crontab -e` and add this example (runs daily at 2:15 AM and writes a log):

```cron
15 2 * * * cd /home/YOUR_WSL_USER/web26 && . /home/YOUR_WSL_USER/.config/lcaustin-photo-batch.env && /home/YOUR_WSL_USER/.local/share/pnpm/pnpm sync:drive-photos >> /home/YOUR_WSL_USER/.local/state/lcaustin-photo-batch.log 2>&1
```

Use `command -v pnpm` to replace the pnpm path above with the actual WSL path. Ensure WSL can remain running at the scheduled time; Windows Task Scheduler can start the WSL command if the computer may otherwise be asleep.

## Safety behavior

- An original stays in `UPLOAD` if resizing, R2 upload, or database recording fails.
- The original moves to `RAW` only after a successful R2 upload, local `RESIZED` copy, and photo database upsert.
- A completed local `RESIZED` copy is safely resumed if an earlier run stopped before archiving its source. Existing `RAW` paths are still treated as failures rather than overwritten.
- Files under 1 KB are skipped, which avoids half-downloaded Drive files. Change `PHOTO_MIN_BYTES` only when necessary.
- Files must be fully synced locally before this job runs. Google Drive for desktop should use **Mirror files** for this folder, or mark the folder available offline.
