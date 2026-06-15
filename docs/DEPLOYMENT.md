# SermonBridge Deployment Checklist

Use this checklist when deploying SermonBridge to a VPS, Hostinger VPS, or any Node.js host that can run a long-lived Next.js server.

## Required Environment Variables

Create a production environment file or set these variables in your server control panel:

```env
DATABASE_URL="file:./prisma/prod.db"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-long-secure-password"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
AUTH_COOKIE_SECURE="true"
OPENAI_API_KEY=""
OPENAI_TRANSCRIPTION_MODEL="whisper-1"
OPENAI_TRANSLATION_MODEL="gpt-4o-mini"
OPENAI_LIVE_TRANSLATION_MODEL="gpt-4o-mini"
OPENAI_DIAGNOSTIC_MODEL="gpt-4o-mini"
OPENAI_TTS_MODEL="gpt-4o-mini-tts"
FFMPEG_PATH=""
```

`OPENAI_API_KEY` is optional for manual operation. Without it, SermonBridge keeps church management, listener pages, embeds, and manual live updates available, while microphone transcription shows clear configuration guidance.

## Cookie And Security Setup

- For an HTTPS domain, set `AUTH_COOKIE_SECURE=true`.
- For a temporary plain HTTP IP test, set `AUTH_COOKIE_SECURE=false`.
- `NEXT_PUBLIC_SITE_URL` must match the real deployed URL, including protocol, because embed codes, listener links, widget URLs, and share links are generated from it.
- Do not use the local fallback admin password in production.

## Database Setup

Local development uses SQLite:

```bash
DATABASE_URL="file:./dev.db"
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

For Hostinger/VPS production, SQLite can work for early live usage if the database file is stored on persistent disk. For a larger deployment, use a managed database such as MySQL and update the Prisma datasource/provider before migrating.

Recommended production setup:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

For schema-controlled production releases, prefer Prisma migrations instead of `db push`:

```bash
npx prisma migrate deploy
```

## Build And Start

```bash
npm install
npm run prisma:generate
npm run build
npm start
```

The app should be served behind HTTPS using your VPS reverse proxy or Hostinger domain configuration.

## OpenAI Setup

Set `OPENAI_API_KEY` only on the server. Never expose it in browser code.

When the key is configured and quota is available:

- Live microphone chunks can be transcribed.
- Live transcript text can be translated.
- Diagnostics can run OpenAI connectivity checks.

When quota is unavailable, manual live updates continue to work.

## Create The First Admin

Set these before seeding:

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-long-secure-password"
```

Then run:

```bash
npm run prisma:seed
```

Warning: never use the default local admin password in production.

## Test Admin Login

1. Visit `/admin/login`.
2. Log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
3. Open `/admin`.
4. Confirm churches, onboarding requests, and diagnostics load.

## Test Church Login

1. Submit a church onboarding request or create a church manually in admin.
2. Approve the request or copy the generated church credentials.
3. Visit `/church/login`.
4. Confirm the church dashboard shows the church profile, embed code, widget code, and live sessions.

## Test Live Session Microphone

1. Visit `/church/live-sessions`.
2. Create a session with listener languages.
3. Open the session detail page.
4. Start the session so it becomes `LIVE`.
5. Use Chrome or Edge.
6. Click Start Microphone and allow microphone permission.
7. Speak into the laptop or connect the church mixer output to the laptop audio input.
8. Confirm transcript messages are created.

## Test Listener Page

1. Copy the listener link from the session detail page.
2. Open it on a phone or second browser.
3. Change listener language.
4. Send a manual update from the church session page.
5. Confirm the listener page updates automatically within a few seconds.
