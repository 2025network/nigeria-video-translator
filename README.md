# Nigeria Video Translator

A Next.js App Router platform for recorded video translation and live church translation embed widgets.

The project has two surfaces:

- Recorded video upload, transcript, subtitle, voice-over, and translated-video demo.
- Live Church Translation Embed Widget platform for churches to paste into an existing website, WordPress page, or mobile app WebView.

OpenAI is optional. When OpenAI is unavailable, demo mode keeps uploads, subtitles, demo voice-over, translated video generation, and live widget previews working.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite for local development
- Hostinger MySQL recommended for production
- FFmpeg audio/video processing with `ffmpeg-static` and `fluent-ffmpeg`
- Optional OpenAI text-to-speech and translation when `OPENAI_API_KEY` is configured

## Local SQLite Setup

Install dependencies:

```powershell
npm.cmd install
```

Create local environment files from the example:

```powershell
Copy-Item .env.example .env
Copy-Item .env.local.example .env.local
```

Local `.env` example:

```env
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL=admin@nigeriavideotranslator.local
ADMIN_PASSWORD=Admin123!
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAI_API_KEY=
```

Generate Prisma Client:

```powershell
npx prisma generate
```

Create or update the local SQLite database:

```powershell
npx prisma migrate dev --name init
```

If Prisma migrate is unavailable on your machine, apply the SQL in `prisma/migrations/20260614000000_init/migration.sql` to `prisma/dev.db`, then run the seed command below.

Seed the database:

```powershell
npx prisma db seed
```

The seed creates:

- Christ Embassy Lagos
- RCCG Abuja
- Winners Chapel Port Harcourt
- One admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`

## Admin Login

Local fallback credentials:

```text
Email: admin@nigeriavideotranslator.local
Password: Admin123!
```

Do not use the default admin password in production. Set a strong `ADMIN_PASSWORD` before running the seed on a deployed server.

## Run Locally

```powershell
npm.cmd run dev
```

Open:

```text
http://localhost:3000/admin/login
```

Useful pages:

```text
http://localhost:3000/admin
http://localhost:3000/admin/churches
http://localhost:3000/admin/embed-guide
http://localhost:3000/embed/grace-city/live
http://localhost:3000/upload
http://localhost:3000/diagnostics
```

## Live Church Embed Widgets

The admin area generates iframe snippets for church websites and app WebViews. In development, iframe URLs use `http://localhost:3000`. In production, set `NEXT_PUBLIC_SITE_URL` so generated iframe code uses your public Hostinger domain.

Example iframe:

```html
<iframe src="http://localhost:3000/embed/grace-city/live" width="100%" height="720" style="border:0;border-radius:16px;" allow="autoplay; encrypted-media" allowfullscreen></iframe>
```

Recommended iframe height: `720px`.

## Production Environment Variables

Set these in Hostinger before building or starting the app:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=use-a-long-strong-password
NEXT_PUBLIC_SITE_URL=https://your-domain.com
OPENAI_API_KEY=
```

- `DATABASE_URL` should use SQLite locally and MySQL in production.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used by the seed script to create the first admin account.
- `NEXT_PUBLIC_SITE_URL` is required for production embed codes so churches receive public iframe URLs instead of localhost URLs.
- `OPENAI_API_KEY` is optional. Leave it empty if OpenAI quota is unavailable. Demo mode will continue to work.

## Production MySQL Note For Hostinger

SQLite is good for local development, but Hostinger production should use MySQL if your hosting plan provides it. Create a MySQL database in Hostinger, copy the connection credentials, and set `DATABASE_URL` to a MySQL connection string before running Prisma commands.

After setting production environment variables, run:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build
npm start
```

Important: set a strong `ADMIN_PASSWORD` before `npx prisma db seed`. Do not seed production with `Admin123!`.

## Hostinger Deployment Checklist

- Set `DATABASE_URL`
- Set `ADMIN_EMAIL`
- Set a strong `ADMIN_PASSWORD`
- Set `NEXT_PUBLIC_SITE_URL`
- Optionally set `OPENAI_API_KEY`
- Run `npm install`
- Run `npx prisma generate`
- Run `npx prisma migrate deploy`
- Run `npx prisma db seed`
- Run `npm run build`
- Run `npm start`
- Test `/admin/login`
- Test `/admin`
- Test `/embed/grace-city/live`
- Copy an iframe from `/admin/churches` and paste it into a test page
- Confirm demo mode works if OpenAI quota is unavailable

## Generated Files

Uploads and generated artifacts are stored under `public` in development/demo mode:

```text
public/uploads
public/audio
public/transcripts
public/translations
public/subtitles
public/voiceovers
public/translated-videos
```

The local SQLite database is stored at:

```text
prisma/dev.db
```

`prisma/dev.db` is ignored by Git and should not be committed. For larger production uploads, move generated media to cloud object storage later. The live embed widget itself does not depend on local upload paths.

## Verification

```powershell
npm.cmd run lint
npm.cmd run build
```
