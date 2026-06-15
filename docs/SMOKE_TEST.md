# SermonBridge Deployment Smoke Test

Run this after each deployment.

## 1. Health Check

Visit:

```text
/api/health
```

Expected result:

- `ok: true`
- `app: "SermonBridge"`
- `databaseReachable: true`
- current server time

## 2. Admin Login

1. Visit `/admin/login`.
2. Log in with the production admin account.
3. Visit `/admin`.
4. Confirm onboarding request and church counts load.

## 3. Approve A Church

1. Visit `/church-onboarding`.
2. Submit a test church request.
3. Visit `/admin/onboarding-requests`.
4. Approve the request.
5. Copy the generated church login credentials.

## 4. Church Login

1. Visit `/church/login`.
2. Log in with the generated church credentials.
3. Confirm `/church/dashboard` shows the church name, embed URL, iframe code, and floating widget code.

## 5. Create A Live Session

1. Visit `/church/live-sessions`.
2. Create a session.
3. Open the session control page.
4. Click Start Session.

## 6. Open Listener Link

1. Copy the listener link.
2. Open it in another browser or on a phone.
3. Confirm the listener page shows the sermon title, status, language selector, and waiting/update area.

## 7. Send Manual Update

1. On the church session page, enter a sermon text update.
2. Send it to one language or all listener languages.
3. Confirm the listener page receives the translated update.

## 8. Test Microphone

Only run this if `OPENAI_API_KEY` is configured and quota is available.

1. Use Chrome or Edge.
2. Keep the session status as `LIVE`.
3. Click Start Microphone.
4. Allow microphone permission.
5. Speak a short test sentence.
6. Confirm transcript messages appear on the session page and listener page.

If microphone transcription fails, check `/church/live-sessions/setup-guide`, server logs, `OPENAI_API_KEY`, quota, and the session health panel.
