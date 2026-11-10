# Google OAuth return navigation

The deployed `/v3/api-docs` was checked on 2026-11-09. It documents password
authentication but does not document `/oauth2/authorization/google`, a
`return_to` parameter, or the frontend success redirect. The backend source and
success-handler configuration are not available in this repository, so support
for an arbitrary return URL has not been confirmed.

Live checks on 2026-11-09 also showed:

- `/auth/google`, with and without `return_to`, returned HTTP 500.
- `/oauth2/authorization/google` returned HTTP 302 to Google, with the provider
  callback `https://verdora-backend.onrender.com/login/oauth2/code/google`.
  This is the backend provider callback, not the final frontend landing URL.
- The published frontend bundle `index-8MuCuEqM.js` still used
  `/auth/google?return_to=...` and did not include the session-storage return
  handler. The updated frontend must be deployed before testing the new flow.
- An unauthenticated current-user request with the GitHub Pages origin received
  matching `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials:
true` headers. This does not confirm a specific browser's authentication
  cookies or that its OAuth sign-in succeeded.

The frontend therefore keeps the Google authorization URL unchanged and saves
the intended in-app destination in session storage before leaving the page.
Only local paths are accepted, including their search parameters and hash.
Login, registration and OAuth callback destinations are excluded to prevent
redirect loops. The default `/` destination is not saved, and a new OAuth
attempt with that destination clears any previous return path. Records expire
after ten minutes.

On the frontend root or `/oauth/callback`, `OAuthReturnHandler` waits for session
hydration and guest-cart synchronization, then consumes the saved destination
and navigates with `replace`. If hydration completes without a user on `/`,
it clears the saved destination and renders Home normally, including when the
user abandoned Google consent. Only `/oauth/callback` shows recovery controls
for a failed session restore, preserving the destination for retry.

## Backend configuration to confirm

- Successful Google authentication must set the session cookies and redirect
  to the same frontend origin and deployment base path that started the flow.
  Session storage is scoped to that origin and tab.
- The preferred landing URL is the frontend root, including its deployment
  base (for example `/verdora-frontend/`). `/oauth/callback` is also supported
  when the host serves SPA routes correctly.
- Confirm the failure redirect and whether a validated, allow-listed
  `return_to` parameter is supported. The frontend does not assume that it is.
- A hard-coded redirect to another frontend origin cannot recover this tab's
  saved destination. Local development and deployed frontend origins therefore
  need matching backend redirect configuration.

Storage/return handling can be checked with mocked session responses, but the
actual provider flow and backend redirect still require an integration check.
