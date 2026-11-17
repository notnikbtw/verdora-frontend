# Verdora — Frontend

Verdora is a plant and gardening e-commerce application with a customer storefront and an admin panel.

## Tech stack

- React 19, TypeScript, Vite 8 and React Router 7.
- Redux Toolkit for authentication state and TanStack Query for server data.
- Tailwind CSS 4, shadcn/ui, Radix UI and Lucide icons.
- React Hook Form and Zod for forms and validation.
- Axios for API requests and React Toastify for notifications.

## Local setup

Use Node.js **24.x** and npm. The Node version is declared in `.nvmrc` and `package.json`; both GitHub Actions workflows read `.nvmrc`.

```bash
git clone https://github.com/notnikbtw/verdora-frontend.git
cd verdora-frontend

# If you use nvm:
nvm install
nvm use

npm ci
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` in `.env` to your backend URL before starting the app:

```env
VITE_API_URL=http://localhost:8081
```

Open [http://localhost:5173/](http://localhost:5173/) or the URL printed by Vite if that port is occupied. Development uses the root path `/`.

The frontend requires a running backend for API features. Requests include cookies (`withCredentials: true`); the backend must allow the frontend origin and credentialed requests. Google sign-in also requires a matching backend redirect configuration; see [OAuth return navigation](docs/oauth-redirect.md).

`VITE_*` variables are embedded into the browser bundle at build time. Use them for public configuration, never private credentials. Restart the dev server after changing `.env`, and rebuild to change production configuration.

## Commands and checks

| Command                | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Start the development server.                            |
| `npm run build`        | Run TypeScript checks (`tsc -b`) and build into `dist/`. |
| `npm run preview`      | Serve the production build locally after building.       |
| `npm run lint`         | Run ESLint.                                              |
| `npm run lint:fix`     | Apply automatic ESLint fixes.                            |
| `npm run format:check` | Check formatting in `src/`.                              |
| `npm run format`       | Format supported files in `src/`.                        |

## CI and deployment

[CI](.github/workflows/ci.yml) runs on pull requests targeting `main`, pushes to `main`, and manual dispatch. It installs dependencies with `npm ci`, checks formatting, runs ESLint, and type-checks/builds the app. CI uses a placeholder API URL to check compilation; it does not test a live backend.

[Deployment](.github/workflows/deploy.yml) runs separately on pushes to `main` or manual dispatch. It builds the app and publishes the `dist/` artifact through GitHub Pages Actions. No `gh-pages` branch is required.

To configure deployment:

1. Select **GitHub Actions** as the source under repository **Settings → Pages**.
2. Set the repository Actions secret **`VITE_API_URL`** to the production backend URL.
3. Push to `main` or run the deployment workflow manually.

CI and deployment are independent workflows. Configure required CI checks in branch protection if merging should depend on those checks passing.

### Production base path

`vite.config.ts` chooses the production base path in this order:

1. `VITE_BASE_PATH`, if set in the build environment.
2. `/<repository-name>/`, derived from `GITHUB_REPOSITORY` in GitHub Actions.
3. `/verdora-frontend/` for local production builds.

React Router reads the same base through `import.meta.env.BASE_URL`. With the default local production build, open `/verdora-frontend/` on the URL printed by `npm run preview`.

For hosting at another path, set `VITE_BASE_PATH` when building (for example, `/` for a root deployment). This variable is read from the build process environment in `vite.config.ts`; supply it in the shell or workflow. The host must serve SPA routes correctly. The current `public/404.html` fallback targets a GitHub Pages project URL with one repository path segment; review it when changing the hosting path.

## Integration notes

- [Checkout API requirements](docs/checkout-api-requirements.md): current delivery limitations and server-authoritative totals.
- [OAuth return navigation](docs/oauth-redirect.md): saved destinations, session restoration and backend redirect requirements.
- [Responsive audit](docs/responsive-audit-2026-11-09.md): findings recorded on 2026-11-09.

These documents include dated backend observations; verify the current backend contract when implementing integration changes.
