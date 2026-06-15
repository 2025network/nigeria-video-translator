# SermonBridge Go-Live Checklist

Use this checklist before opening SermonBridge to a real church service.

## Domain

- Confirm `NEXT_PUBLIC_SITE_URL` matches the public domain.
- Confirm generated listener links and embed codes use the public domain.
- Confirm DNS points to the deployment server.

## HTTPS

- Enable HTTPS for the public domain.
- Set `AUTH_COOKIE_SECURE=true` when using HTTPS.
- Use `AUTH_COOKIE_SECURE=false` only for temporary plain HTTP IP checks.

## Admin Login

- Set a strong `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Run the seed command if the first admin has not been created.
- Visit `/admin/login` and confirm the admin dashboard loads.

## Church Login

- Create or approve a church account.
- Visit `/church/login`.
- Confirm the church dashboard, profile, widget, and live sessions pages load.

## OpenAI Key

- Set `OPENAI_API_KEY` on the server.
- Confirm quota is available.
- Confirm `OPENAI_TRANSCRIPTION_MODEL` is set, usually `whisper-1`.
- Use diagnostics only from an admin context and never expose the API key.

## Health Endpoint

- Visit `/api/health`.
- Confirm `ok` is `true`.
- Confirm `databaseReachable` is `true`.

## Create Session

- Visit `/church/live-sessions`.
- Create a live sermon session.
- Select the source language and listener languages.
- Open the session control page.

## Start Mic

- Use Chrome or Microsoft Edge.
- Start the session before microphone capture.
- Allow microphone permission.
- Connect the laptop microphone or church mixer audio feed.
- Confirm the session health panel shows readiness.

## Listener Phone Test

- Copy the listener link.
- Open it on a phone.
- Select a listener language.
- Confirm the page says it is listening in the selected language.
- Confirm the latest update time changes after a message is sent.

## Manual Backup

- Send a manual update from the session control page.
- Confirm the listener phone receives it.
- Keep a media team member ready to publish manual updates if microphone capture is unavailable.

## End Session

- Click End Session after the service.
- Confirm the listener page shows the ended state.
- Review any recent live errors before the next service.
