<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Guidelines for AI coding agents (and human contributors) working in this repository.
Read this file before making changes. It defines project conventions, hard rules, and the documentation contract described below.

## Project Overview

**lingo.** (`conversation-language-learning`) is a conversation-first AI language-learning studio. It is a **Next.js 16 (App Router)** application — React 19, TypeScript, Tailwind CSS v4 — with a deliberately minimal dependency set (see `package.json`). Design direction is documented in `ideas.md` ("Midnight Atlas").

- Dev server: `pnpm dev` (Next.js + Turbopack, port 3000)
- Build: `pnpm build` (Next.js production build to `.next/`)
- Production start: `pnpm start` (Next.js server; serves pages and `/api` route handlers)
- Typecheck: `pnpm check` (`tsc --noEmit`)
- Format: `pnpm format` (Prettier)

Package manager is **pnpm** (`packageManager` pinned in `package.json`). Do not use npm/yarn.

## Hard Rules

- This is an **App Router** project: routes are files under `src/app/`. Never add `pages/`-router files.
- **Server vs client:** components are Server Components by default. Add `"use client";` at the top of any file that uses hooks, browser APIs, or event handlers. `src/app/page.tsx`, `src/app/not-found.tsx`, `src/components/Providers.tsx`, and `src/components/ui/sonner.tsx` are client components.
- Never hand-fork `src/components/ui/**` beyond what is required; these are shadcn/ui primitives. Prefer adding new variants via CVA patterns rather than forking components.
- Keep the dark-first "Midnight Atlas" aesthetic: ink-dark surfaces (`#090b10`, `#0e121a`), signal-lime accent (`#D7F35B`), Space Grotesk display / DM Sans body.
- Respect `prefers-reduced-motion` for all animations (see `src/app/globals.css`).
- Use the path alias `@/*` → `src/*` (configured in `tsconfig.json`, which Next.js honors). Never use deep relative imports across this boundary.
- Client-side environment variables must use the `NEXT_PUBLIC_` prefix. Never expose secrets to client code.
- Run `pnpm check` before considering any change complete, and `pnpm build` for non-trivial changes. Fix type errors; do not suppress them.
- Backend endpoints belong in `src/app/api/**` as route handlers. Do not put API logic inside components.

## Project Structure

See **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)** for the complete directory layout, hierarchy rules, and organization guidelines. Summary:

- `/src/app` — App Router: `layout.tsx`, `page.tsx` (home), `not-found.tsx`, `globals.css`, `api/health/route.ts`
- `/src/components` — `Providers.tsx`, `ErrorBoundary.tsx`, and `ui/sonner.tsx` (the single shadcn/ui primitive)
- `/src/lib` — `utils.ts` (`cn()` helper)
- `/public` — static assets (`favicon.svg`, `hero.svg`)

## Documentation Guidelines

- Refer to `DEVELOPER_CONTEXT.md` for context before making changes — it exists precisely so agents and developers do **not** have to re-analyze the entire codebase every session.
- **Always maintain `DEVELOPER_CONTEXT.md` up to date.** It is the single source of truth for how this codebase currently works.
- Document any **added functionality**, **new components**, **state hooks**, and **configuration options** (env vars, next.config options, scripts) in `DEVELOPER_CONTEXT.md` as part of the same change that introduces them.
- **`DEVELOPER_CONTEXT.md` must include all major file changes, the functionality they deliver, and a deep explanation of components and code** — not just file lists. If a future model reads only that file, it should be able to work on the project without re-reading every source file.
- Provide clear explanations for complex or potentially confusing features — e.g. **scroll animation timelines, typewriter state hooks, custom carousels, stacking contexts**, IME composition handling, theme context switching, server/client component boundaries, React Compiler behavior, and many more.
- When a change alters public behavior (routes, env vars, component props, design tokens), update the corresponding section of `DEVELOPER_CONTEXT.md` **and** `PROJECT_ARCHITECTURE.md` if files/folders moved.
- Keep documentation in sync in the same commit as the code change. A change is not done until the docs reflect it.
- Do not delete the `<!-- BEGIN:nextjs-agent-rules -->` block at the top of this file — `next dev` regenerates it.

### What to add to `DEVELOPER_CONTEXT.md` for every non-trivial change

1. **File(s) touched** — created / modified / deleted, with paths.
2. **What changed and why** — the functionality delivered, not just the diff.
3. **Deep explanation** — how the new component/hook/util/route works internally (state flow, side effects, server/client boundary, caching, performance notes, edge cases, stacking contexts, animation timing, etc.).
4. **Configuration impact** — new env vars, script changes, next.config options, Tailwind tokens.
5. **Integration points** — where it plugs into the router, providers, layout, or API layer.

## Conventions

- **Naming**: PascalCase component files (`Home` lives in `src/app/page.tsx`), route handler files are always `route.ts`.
- **Routing/App Router**: pages are `src/app/<segment>/page.tsx`; layouts wrap segments via `layout.tsx`; the global 404 is `src/app/not-found.tsx`. Dynamic route params are **async** (`await params`).
- **Styling**: Tailwind v4 with `@theme inline` tokens in `src/app/globals.css`. Prefer the `cn()` helper (`@/lib/utils`) for conditional classes. Brand utilities: `.font-display`, `.eyebrow`, `.section-title`, `.animate-fade-up`, `.animate-float`.
- **State**: local `useState` first; no global state library is installed and there is no `src/hooks/` directory — create one only when a hook is genuinely reused across files.
- **Toasts**: `sonner` (`toast.success(...)`, `toast(...)`), `<Toaster theme="dark" />` is mounted in `src/components/Providers.tsx`.
- **Icons**: `lucide-react`.
- **API**: Next.js route handlers under `src/app/api/<domain>/route.ts` exporting `GET`/`POST`/etc. Server-only code may use Node APIs; never import it into client components.
- **Tests**: no test framework is installed; if tests are needed, agree on one before adding it.
