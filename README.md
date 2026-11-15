# Verdora - Front-End Application

Verdora is a modern, eco-conscious, green e-commerce and marketplace platform. This repository contains the front-end application built with React 19, TypeScript, Tailwind CSS v4, and Vite.

---

## Tech Stack

- **Core Framework**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Build Tooling**: [Vite](https://vite.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & [React Query (TanStack Query)](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Routing**: [React Router v7](https://reactrouter.com/) (configured with `/Verdora-frontend/` base path)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## Local Setup

1. **Clone the repository:**

```bash
git clone https://github.com/IRFI4/Verdora-frontend.git
cd Verdora-frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and copy the contents from `.env.example`:

```bash
cp .env.example .env
```

Modify the variables as needed:

```env
VITE_API_URL=http://localhost:8081
```

4. **Start the development server:**

```bash
npm run dev
```

Open [http://localhost:5173/Verdora-frontend/](http://localhost:5173/Verdora-frontend/) in your browser.

5. **Build the production bundle:**

```bash
npm run build
```

The built assets will be generated in the `dist/` directory.

---

## Deployment

### GitHub Pages (Static Hosting)

This project is configured with a base path of `/Verdora-frontend/` in both Vite and React Router, making it perfectly suited for GitHub Pages.

- Make sure `base` in `vite.config.ts` matches your repository name:

```typescript
base: '/Verdora-frontend/';
```

- Deploy the contents of the `dist/` directory directly to your `gh-pages` branch.

### Containerized Deployment (Docker / Kubernetes)

Build the production Docker image:

```bash
docker build --target production -t verdora-frontend:latest .
```

Run the image exposing port 80:

```bash
docker run -p 80:80 verdora-frontend:latest
```
