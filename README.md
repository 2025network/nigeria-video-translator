# Nigeria Video Translator

A Next.js App Router demo platform for recorded video translation and live church translation embed widgets.

The project has two demo surfaces:

- Recorded video upload, transcript, subtitle, voice-over, and translated-video demo.
- Live Church Translation Embed Widget demo for churches to paste into an existing website, WordPress page, or mobile app WebView.

The app is production-ready as a demo platform and does not require OpenAI quota to run. When OpenAI is unavailable, demo mode keeps uploads, subtitles, demo voice-over, translated video generation, and live widget previews working.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- FFmpeg audio/video processing with `ffmpeg-static` and `fluent-ffmpeg`
- Optional OpenAI text-to-speech and translation when `OPENAI_API_KEY` is configured
- Demo transcription, translation, live subtitles, and embed widgets when OpenAI is unavailable

## Local Setup

Install dependencies:

```powershell
npm.cmd install
```

Create a local environment file:

```powershell
Copy-Item .env.local.example .env.local
```

Example `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAI_API_KEY=
```

`OPENAI_API_KEY` is optional. The app works in friendly demo mode without an API key, without quota, or while OpenAI credits are unavailable.

## Run Locally

```powershell
npm.cmd run dev
```

Open:

```text
http://localhost:3000
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

Set these in Hostinger before starting the app:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
OPENAI_API_KEY=
```

- `NEXT_PUBLIC_SITE_URL` is required for production embed codes so churches receive public iframe URLs instead of localhost URLs.
- `OPENAI_API_KEY` is optional. Leave it empty if OpenAI quota is unavailable. Demo mode will continue to work.

## Hostinger Deployment Steps

1. Upload or clone the project to your Hostinger Node.js app directory.
2. Set the app root to the folder that contains `package.json`.
3. Set production environment variables:
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
   - `OPENAI_API_KEY=` optional
4. Install dependencies:

```bash
npm install
```

5. Build the app:

```bash
npm run build
```

6. Start the app:

```bash
npm start
```

7. Test the admin dashboard:

```text
/admin
```

8. Test the embed widget:

```text
/embed/grace-city/live
```

## Deployment Checklist

- Run `npm install`
- Run `npm run build`
- Run `npm start`
- Set `NEXT_PUBLIC_SITE_URL`
- Optionally set `OPENAI_API_KEY`
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

For larger production uploads, move generated media to cloud object storage later. The live embed widget itself does not depend on local upload paths.

## Verification

```powershell
npm.cmd run lint
npm.cmd run build
```
