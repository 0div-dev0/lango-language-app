# PROJECT_ARCHITECTURE.md

Authority on **folder hierarchy and code organization** for this repository.
When adding files, place them according to the rules below; when in doubt, prefer the smallest structure that fits.

## 1. Folder hierarchy

```
conversation-language-learning/
├── public/                     # Static assets served at the site root
│   ├── favicon.svg             # Lingo mark (lime rounded square + arcs)
│   └── hero.svg                # Hero atmosphere art (waves + glows)
├── src/
│   ├── app/                    # Next.js App Router — the only routing layer
│   │   ├── layout.tsx          # Root layout: metadata, viewport, Providers, analytics
│   │   ├── page.tsx            # Home (the entire landing experience)
│   │   ├── not-found.tsx       # Global 404 page
│   │   ├── globals.css         # Tailwind v4 theme tokens + brand utilities
│   │   └── api/
│   │       └── health/
│   │           └── route.ts    # GET /api/health liveness endpoint
│   ├── components/
│   │   ├── Providers.tsx       # Client provider stack: ErrorBoundary → Toaster
│   │   ├── ErrorBoundary.tsx   # Top-level React error boundary (reload UI)
│   │   └── ui/
│   │       ├── sonner.tsx      # shadcn/ui Toaster wrapper (the only ui primitive)
│   │       └── beams-background.tsx  # BeamsBackground: bespoke hero light-beam canvas (not shadcn)
│   └── lib/
│       └── utils.ts            # cn() — clsx + tailwind-merge
├── ideas.md                    # Design brief ("Midnight Atlas")
├── AGENTS.md                   # Agent/contributor rules + documentation contract
├── DEVELOPER_CONTEXT.md        # Deep, living description of how the code works
├── PROJECT_ARCHITECTURE.md     # This file
└── package.json                # Minimal dependency set (see §5)
```

## 2. Hierarchy rules

1. **`src/app/` is the only routing layer.** Pages (`page.tsx`), the root `layout.tsx`, the global `not-found.tsx`, `globals.css`, and API route handlers (`**/route.ts`) live here. Never create a `pages/` directory.
2. **`src/components/` holds React components.** One component per file, PascalCase filenames. Global wrappers (`Providers.tsx`) sit at the top of the folder; shadcn/ui primitives live in `src/components/ui/`. Bespoke effect/background components (e.g. `ui/beams-background.tsx`) may also live in `ui/` — only `sonner.tsx` is shadcn.
3. **`src/lib/` holds plain utilities** with no React imports.
4. **`public/` holds static assets only.** Reference them by root-absolute path (`/hero.svg`). No server logic, no API routes in `public/`.
5. **No `src/hooks/`, `src/contexts/`, or `shared/` directories exist today.** Create `src/hooks/` only when a custom hook is genuinely reused across files; do not create the others speculatively.

## 3. Where does a new file go? (decision guide)

| I want to add…              | Put it in                       | Notes                                                                  |
| --------------------------- | ------------------------------- | ---------------------------------------------------------------------- |
| A new page/route            | `src/app/<segment>/page.tsx`    | File-system routing                                                    |
| A server endpoint           | `src/app/api/<domain>/route.ts` | Export `GET`/`POST`/…; keep API logic out of components                |
| A reusable UI piece         | `src/components/<Name>.tsx`     | Client component only if it needs hooks/events                         |
| A shadcn/ui primitive       | `src/components/ui/<name>.tsx`  | Install with the shadcn CLI (`components.json` aliases are configured) |
| A pure utility              | `src/lib/<name>.ts`             | No React imports                                                       |
| A global style/token change | `src/app/globals.css`           | Tailwind v4 `@theme inline` tokens                                     |
| A static asset              | `public/`                       | Root-absolute reference                                                |

## 4. API layer conventions

- Every endpoint is a Next.js **route handler**: `src/app/api/<domain>/route.ts` exporting named verb functions.
- Handlers run **server-side only** — secrets live in non-`NEXT_PUBLIC_` env vars.
- The only current endpoint is `GET /api/health` (liveness: `{ status, service, version, timestamp }`).

## 5. Dependency policy

This project keeps a **deliberately minimal** dependency set (9 runtime deps: `next`, `react`, `react-dom`, `sonner`, `lucide-react`, `clsx`, `tailwind-merge`, `gsap`, `@gsap/react`).

- Before adding a dependency, check it is truly needed; prefer platform primitives (CSS, Next.js APIs, React state).
- The site's bespoke "Midnight Atlas" design is hand-rolled Tailwind — shadcn/ui components were pruned to the single `sonner.tsx` primitive. Re-add others via the shadcn CLI only when a real reuse case appears.
- Do not re-introduce platform-specific tooling (debug collectors, storage proxies, OAuth helpers) unless the platform requirement is confirmed and documented here.

## 6. Concurrency & boundaries

```
Browser
  └─ src/app/page.tsx (client component: the interactive landing page)
       ├─ sonner toasts (Toaster mounted in Providers)
       ├─ gsap motion layer (hero entrance + ScrollTrigger reveals, scoped to the page root;
       │    see DEVELOPER_CONTEXT.md §4.3.1)
       ├─ ui/beams-background.tsx (canvas light beams inside the hero media stack)
       └─ static assets (/hero.svg, /favicon.svg from public/)
  └─ src/app/not-found.tsx (client component: dark 404)
Server (next start)
  └─ serves pages + /api/* route handlers
```

- Components are Server Components by default; `page.tsx`, `not-found.tsx`, `Providers.tsx`, and `ui/sonner.tsx` opt into the client with `"use client"`.
- Anything reading env vars without `NEXT_PUBLIC_` must stay server-side.

## 7. Static assets

- A static binary/SVG asset always goes in `public/` and is referenced as `/<file>`. There is **no** storage proxy — assets must exist in the repository.

## 8. Housekeeping

- `.next/` is generated — never hand-edit or commit.
- Keep this file and `DEVELOPER_CONTEXT.md` updated in the same change as any file move/creation described above.
