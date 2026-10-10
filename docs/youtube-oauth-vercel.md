# YouTube OAuth on Vercel

The browser only calls same-origin paths (`/auth/*`, `/api/*`, and the other
backend prefixes). `vercel.json` forwards those paths to the existing Dev
Tunnel backend and sets `X-Tunnel-Skip-AntiPhishing-Page: true` on the request
Vercel sends upstream. Do not replace the backend URL.

## Production OAuth settings

The live frontend origin is:

```
https://leadhive-ai-web.vercel.app
```

Do not infer the Google callback from the frontend hostname. The exact
`GOOGLE_REDIRECT_URI` must be copied from the `redirect_uri` query parameter in
the Google authorization URL returned by `/auth/google/login`, then compared
byte-for-byte with both the backend configuration and the Google Cloud Console
authorized redirect URI. The backend and Google settings are not stored in this
frontend repository.

After the backend exchanges the authorization code, it must redirect the
browser back to the live application, for example:

```
https://leadhive-ai-web.vercel.app/dashboard?auth=success&channel_id=<youtube-channel-id>
```

The Google `redirect_uri` must be identical in Google Cloud Console and the
backend, including the scheme, hostname, path, and trailing-slash behavior.
Preview deployment URLs need their own registered redirect URI; do not use them
for the production OAuth client.

## Session cookie contract

This same-origin cookie contract assumes the verified Google `redirect_uri`
returns through an `/auth/*` URL on the live Vercel origin, which Vercel then
proxies to the backend. In that setup, the session cookie must be either
host-only (omit `Domain`, preferred) or have
`Domain=leadhive-ai-web.vercel.app`. It must not use the Dev Tunnel domain. Set
`Secure`; use `SameSite=Lax` for the top-level Google OAuth return. Use
`SameSite=None; Secure` only if the application deliberately needs a cross-site
cookie flow.

The frontend already uses `credentials: 'include'` for every API request. After
the callback, `/dashboard` waits for `/auth/me` and `/auth/channels` before it
navigates to the selected channel, so a valid session loads without a manual
refresh. OAuth browser navigation and the authorization-code callback are never
retried by the frontend.
