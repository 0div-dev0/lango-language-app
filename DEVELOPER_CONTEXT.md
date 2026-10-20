# DEVELOPER_CONTEXT.md

Deep, living context of the **lingo.** codebase (`conversation-language-learning`).
Read this instead of re-analyzing the repository. **Maintain it in every non-trivial change** (rules in `AGENTS.md` → Documentation Guidelines).

_Last major update: 2026-10-20 — GSAP motion layer, beams hero background, floating glass navbar._

## 1. What this project is

A single-page marketing/landing experience for "lingo.", a conversation-first AI language-learning studio. There is **no real backend**: the only server code is a liveness route handler. The "product" interactions on the page (chat demo, phrase saving, translations) are **client-side simulations** with local React state and toast feedback — no network calls.

**Platform:** plain Next.js. Nothing Manus-specific remains (no debug collector, no storage proxy, no OAuth helpers, no platform patches).

## 2. Stack

- **Next.js 16.4.2** (App Router, Turbopack, `cacheComponents`, `partialPrefetching`, React Compiler via `babel-plugin-react-compiler`)
- **React 19.3**, TypeScript (strict)
- **Tailwind CSS v4** (`@import "tailwindcss"` + `@theme inline` tokens in `src/app/globals.css`; Turbopack loader `@tailwindcss/turbopack`)
- **sonner** (toasts) + **lucide-react** (icons) + **clsx**/**tailwind-merge** (`cn()` helper)
- **gsap** `3.15` (ScrollTrigger included; the whole motion layer — see §4.3.1) + **@gsap/react** (`useGSAP` hook)
- Package manager: **pnpm** (pinned `10.15.1` in `package.json`; corepack)

That's the entire dependency surface (9 runtime deps). shadcn/ui was pruned to a single primitive (`ui/sonner.tsx`); `components.json` remains so shadcn components can be re-added via CLI if ever needed.

## 3. Commands

```
pnpm dev     # Next.js dev server on :3000 (Turbopack)
pnpm build   # production build → .next/
pnpm start   # production server (uses PORT env if set)
pnpm check   # tsc --noEmit (strict)
pnpm format  # prettier --write
```

Note: `next dev` re-writes the `<!-- BEGIN:nextjs-agent-rules -->` block at the top of `AGENTS.md` — that's expected; commit it.

## 4. File map (complete)

```
public/
  favicon.svg                 Lingo mark: lime rounded square (#d7f35b) + two 270° arcs
                              (replicates the CSS logo mark in the header)
  hero.svg                    Hero atmosphere art: 1600×900, ink base (#090b10), cyan/violet
                              radial glows, luminous signal waves, signal nodes, concentric
                              arcs top-right, sparse particles. Referenced by page.tsx.
src/
  app/
    layout.tsx                Root layout (server): metadata/viewport, <Providers>, optional
                              umami analytics <script> when NEXT_PUBLIC_ANALYTICS_* are set
    page.tsx                  "use client" — the entire landing page (~320 lines + GSAP motion layer, see §4.3/§4.3.1)
    not-found.tsx             "use client" — global 404, restyled to the dark lingo design
    globals.css               Tailwind v4 theme + brand utilities (see §5)
    api/health/route.ts       GET /api/health → { status, service, version, timestamp }
  components/
    Providers.tsx             "use client" — ErrorBoundary → <Toaster theme="dark"/> → children
    ErrorBoundary.tsx         Class component; on error renders stack + Reload Page button
                              (uses --destructive/--muted tokens)
    ui/sonner.tsx             shadcn Toaster wrapper, pinned dark (no next-themes dependency)
    ui/beams-background.tsx   BeamsBackground — rising light-beam canvas behind the hero
                              (performance rewrite: baked sprites, 40fps cap, pause when
                              off-screen/hidden; see §4.3.1)
  lib/
    utils.ts                  cn() = twMerge(clsx(...))
```

### 4.1 App shell — `layout.tsx` + `Providers.tsx`

- `layout.tsx` is a **Server Component**. Exports `metadata` (title, description, `icons.icon = "/favicon.svg"`) and `viewport` (themeColor `#090b10`, locked scale 1). The umami analytics script tag renders only when both `NEXT_PUBLIC_ANALYTICS_ENDPOINT` and `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` exist.
- `Providers.tsx` is the only client-side wrapper: `ErrorBoundary` (crash safety) → sonner `Toaster` (dark) → page content. There is **no theme provider and no tooltip provider** — the site is dark-only; all colors are hard-coded in `globals.css` `:root`.

### 4.2 404 — `not-found.tsx`

Client component using `useRouter().push("/")`. Styled like the landing page (ink background `#090b10`, lime mark, `font-display` headline) — no shadcn imports. The mark replicates the header logo with two rotated bordered circles.

### 4.3 Home — `page.tsx`

"use client" single file; all interactive state is local `useState`:

- `mobileOpen` — mobile nav dropdown under the fixed header.
- `started` — result of `begin()`; scrolls to `#practice`.
- `translate` — toggles AI-message translations in the chat demo.
- `saved` — toggles the "phrase saved" state on the last-seen phrase button.
- `message` / `messages` — the chat demo. `sendMessage()` appends the user message plus a canned AI reply (`"Perfecto. Suena muy bien."`) and fires a toast. Initial messages simulate a café ordering conversation in Spanish with English translations.

Helpers: `scrollTo(id)` (smooth scroll to a section anchor), `begin()` (start + scroll), `comingSoon()` (toast placeholder for Sign in / Privacy / Terms / Contact).

Sections: floating glass header (logo mark + nav + CTA) → hero (`#practice`-bound CTA) → "How it works" (3 `Step` cards) → "Practice" (chat demo + learning-context sidebar) → "Languages" (12-tile grid) → final CTA band → footer.

**Floating glass header:** `fixed left-4 right-4 top-4` (lg:6) `mx-auto max-w-[1380px] rounded-[22px]`, `bg-[#090b10]/35 backdrop-blur-2xl backdrop-saturate-150` — inset from the viewport edges with rounded corners and **no divider line**; brightens to `bg-[#090b10]/60` on hover via `transition-[background-color]`.

**Hero media stack** (inside `[data-hero-media]`, GSAP-parallaxed): `/hero.svg` at `opacity-[0.14]` (deliberately faint) → radial + left-to-right ink gradient → `<BeamsBackground/>` placed **above** the scrim so the beams gleam → bottom fade into `#090b10`.

**Hero typography:** headline is `text-[clamp(2.4rem,9.5vw,7rem)] leading-[.94] tracking-[-.045em]` on Space Grotesk — tight negative tracking is what keeps large display type from looking stretched (ui-ux-pro-max guidance).

The `Step` sub-component is defined at the bottom of the file (icon, number, title, body) and carries `data-pop` for hover pops.

### 4.3.1 The motion layer (GSAP)

Everything animates from a single `useGSAP((context, contextSafe) => …, { scope: rootRef })` block in `Home`. `gsap.registerPlugin(ScrollTrigger)` runs first; the next statement bails out entirely under `prefers-reduced-motion: reduce`, leaving every element at its natural, fully visible CSS state (verified with CDP media emulation: 0 of 41 animated elements hidden). Declarative `data-*` attributes on the JSX drive the tweens so markup stays readable.

**Hero entrance timeline** — eyebrow → `[data-title-line]` (3 lines, stagger) → copy → `[data-hero-cta] > *` → stats → `[data-parallax-card]`, all `fromTo` with explicit values. The CTA buttons and the card pass `clearProps: "all"` so inline styles are removed on completion — otherwise GSAP's inline `transform`/`opacity` would permanently override Tailwind's `hover:-translate-y-1` etc.

**Scroll-scrubbed parallax** — `[data-hero-media]` (scaled 1.08 so no edge is exposed) drifts `yPercent: 14`; `[data-hero-content]` lifts −70px and fades out; the floating card moves fastest (−80px, `scrub: 1`).

**Interactive headline** — `gsap.quickTo` (one reused tween per axis rather than a new tween per `pointermove`) moves the h1 up to ±16px/±9px opposite the pointer and tilts the floating card (x/y/rotation, `data-card-tilt`). Mouse pointers only — touch pointers bail (`event.pointerType !== "mouse"`). Hovering one `[data-title-line]` lifts it 16px and dims its siblings to 45% opacity (`overwrite: "auto"`). These are DOM listeners, which `useGSAP` cannot manage, so they are registered manually inside the scope and removed in the returned cleanup (as are the `[data-pop]` hover-pop listeners, wrapped in `contextSafe`).

**Section reveals** (all `once: true`, all `fromTo`, all `clearProps: "all"`):

- `[data-reveal]` — block rises 28px with `back.out(1.4)`. **`start: "top bottom"`, not a percentage** — a percentage start (e.g. `top 88%`) is geometrically unreachable for blocks at the very end of the document: the footer's top can never scroll above ~88% of the viewport, so the trigger would never fire and the footer would stay hidden forever.
- `[data-reveal-stagger]` — children pop in with scale + overshoot, `stagger: 0.09`, `back.out(1.6)` (intro copy, Step cards, chat messages, learning sidebar).
- `[data-reveal-title]` — headings slide in from off-screen (±110px, alternating direction by index), `back.out(1.5)`.
- `[data-reveal-fade]` — opacity-only stagger for the hairline-gap language grid (so tiles never shift), plus a second tween that flashes each tile `rgba(215,243,91,.16)` lime on arrival then settles to `#0e121a` with `clearProps: "backgroundColor"` — handing the background back to the CSS `hover:bg-[#171e2a]` state.
- `.section-title span` — the dim second line of each section title flashes `#d7f35b` and settles to `rgba(255,255,255,.38)`.

**Hover pops** — `[data-pop]` (language tiles + `Step` cards) scale 1.03 / y−4 on `pointerenter`, settle with `back.out(2)` on leave.

**Ring parallax** — decorative `[data-ring]` circles drift −70px, scrubbed against their closest `<section>`.

#### Fast-scroll visibility guard (bidirectional instant visibility manager)

**Symptom:** when scrolling fast (both downwards and upwards), content and titles did not load instantly, leaving blank spaces or delayed pop-ins for 0.5–1s.
**Root causes:**

1. **CSS root smooth-scrolling desync:** `html { scroll-behavior: smooth; }` in `globals.css` forced browser-level interpolation across all wheel/touchpad scroll gestures, introducing latency between user input and GSAP ScrollTrigger ticker updates.
2. **Hero scrub fadeout blackout:** `[data-hero-content]` was scrubbed to `autoAlpha: 0` by `bottom 30%` of the hero. When scrolling back up from below, the hero headline and copy stayed invisible until the very top, and `[data-parallax-card]` had `scrub: 1` (a 1-second lag delay).
3. **Late triggers, long durations, and off-screen translations:** Section reveals waited until `start: "top 85%"` (15% inside the viewport) before starting, ran for 0.75–0.9s duration (+ 0.09s staggers), and section titles flew in from ±110px off-screen over 0.9s.
4. **Ineffective unidirectional guard with excessive threshold:** The previous guard used `ARM_VELOCITY = 1500px/s` (normal fast scrolling is 300–1000px/s, so it remained dormant), and only inspected `rect.top < window.innerHeight` of `targets()[0]`, failing when scrolling up (where elements enter from above the viewport).

**Fix:**

- Removed `html { scroll-behavior: smooth; }` from `globals.css`. Instant 1:1 scroll response is restored; programmatic smooth scrolling remains supported on anchor clicks via `scrollIntoView({ behavior: "smooth" })`.
- Hero parallax scrub: `[data-hero-content]` now lifts gently (`y: -50`) with subtle `opacity: 0.35` spanning `bottom top` — it never blacks out prematurely. Card scrub lag reduced from `1` to `0.3`.
- Section reveals: snappy 0.35–0.45s durations, subtle vertical rise (`y: 16–18`), tighter staggers (0.02–0.035s), earlier triggers (`top 95%` and `top bottom+=40px`), and `fastScrollEnd: 350`.
- **Bidirectional Instant Visibility Manager:**
  - **IntersectionObserver lookahead (300px margin):** watches all reveal containers and pre-completes entrance animations 300px before they reach the viewport in either direction.
  - **Velocity & Direction Tracker:**
    - Any scroll-up motion (`dy < 0`) immediately completes all elements entering from above or within the upper viewport buffer.
    - Fast scrolling (`velocity > 180px/s`) snaps all approaching elements in the scroll direction.
    - Fling / jump (`velocity > 700px/s`) snaps all remaining entrance animations across the entire page to `progress(1)`.
    - 40ms settle timer ensures 100% completion when scroll stops.
  - **Programmatic Pre-reveal:** `scrollTo(id)` / `begin()` synchronously pre-completes all entrance tweens for the target container before initiating smooth scroll via `revealTargetRef`.

#### The `gsap.from()` vs `fromTo()` gotcha

`gsap.from()` captures the element's current computed styles as the tween's _end_ state at instantiation. On elements carrying CSS transitions (every `<button>` gets `transition` + `hover:-translate-*` from `globals.css`), that captured "natural" state can be corrupted: the tween reaches `progress: 1` yet the element stays visually at its from-state. This froze the hero CTAs and the language tiles at `opacity: 0` in both dev and prod. **Rule: use `fromTo` with explicit start/end values for anything interactive**, and `once: true` for reveals. This bug class is invisible to `pnpm check`/`pnpm build` — verify visually (CDP screenshots + computed-opacity probes).

#### BeamsBackground — `src/components/ui/beams-background.tsx`

Canvas of rising cyan→violet light beams behind the hero (`intensity="strong"`). A performance rewrite of the classic beams demo:

- **Baked sprites:** beam softness (vertical alpha ramp × horizontal edge falloff via `destination-in`) is drawn once into 96×256 per-hue sprites; each frame is only `clearRect` + N× `drawImage` with `globalCompositeOperation: "lighter"` — no per-frame `ctx.filter` blur and no CSS filter on the canvas (the original's biggest cost).
- **Budgets:** `devicePixelRatio` capped at 1.5 and total canvas pixels at 3.5M, so 4K/retina stays cheap; 18 beams desktop, 12 under 768px.
- **Pacing:** ~40fps frame cap with dt-scaled movement, so 120Hz displays don't double the work and beam speed is frame-independent.
- **Lifecycle:** pauses via `IntersectionObserver` (scrolled out of view) and `visibilitychange` (tab hidden); never starts under `prefers-reduced-motion` (a single static frame is drawn instead); debounced (150ms) resize re-derives size, dpr, and beam count.
- Renders `aria-hidden` + `pointer-events-none`; accepts optional `children` (rendered in a `pointer-events-auto` overlay), though the hero uses it as a bare layer.

Integration: imported in `page.tsx`, rendered inside the hero's media stack between the ink scrim and the bottom fade.

### 4.4 API — `api/health/route.ts`

`GET /api/health` returns JSON `{ status: "ok", service: "lingo", version: "1.0.0", timestamp }`. Documented seed of the API layer; new endpoints go in `src/app/api/<domain>/route.ts`.

## 5. Design system ("Midnight Atlas") — `globals.css`

- **Palette:** ink surfaces (`--background` ≈ `#090b10`), near-white foreground, lime primary (`--primary` ≈ `#d7f35b`), muted slate secondaries, 10–12% white borders. Dark-only — there is no `.dark` class and no light theme.
- **Fonts:** DM Sans (body, `--font-sans`) + Space Grotesk (display, `--font-display`), loaded via a Google Fonts `@import` at the top of `globals.css`. `.font-display` utility is also defined in `@layer components`.
- **Brand utilities:** `.eyebrow` (10px uppercase tracking label), `.section-title` (clamp 2.75–5rem display headline with muted `<span>`s), `.animate-fade-up`, `.animate-float`.
- **Motion:** `fade-up` and `float` keyframes; a `prefers-reduced-motion` block kills animations globally. Buttons globally get `cursor: pointer`, a transform/color transition, and `:active { scale(.97) }`. The GSAP motion layer (§4.3.1) also bails out entirely under reduced motion.
- **Header:** floating glass bar — inset from the viewport (`left-4 right-4 top-4`, lg:6), `rounded-[22px]`, `bg-[#090b10]/35` + `backdrop-blur-2xl backdrop-saturate-150`, **no divider line**; hover brightens to `/60`.
- Most one-off styling (radii, shadows, opacities) is done with arbitrary Tailwind values inline (`bg-[#141a23]`, `shadow-[0_30px_100px_rgba(0,0,0,.28)]`, …) — intentionally, to keep the design bespoke.

## 6. Client/server boundaries

- Client components: `page.tsx`, `not-found.tsx`, `Providers.tsx`, `ui/sonner.tsx` — each marked `"use client"`.
- Server: `layout.tsx`, `api/health/route.ts`. No Node APIs are used anywhere; no data fetching exists.
- React Compiler is enabled — avoid patterns that fight it (manual memoization is unnecessary here).

## 7. Static assets

`public/` is served at the root. The hero art (`hero.svg`) and favicon (`favicon.svg`) are hand-authored SVGs committed to the repo. **There is no storage proxy** — if a binary asset (e.g. a photo hero) is added, commit it to `public/` and reference it as `/<file>`.

## 8. Environment variables

| Name                               | Scope  | Used by      | Purpose                                                                   |
| ---------------------------------- | ------ | ------------ | ------------------------------------------------------------------------- |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT`   | client | `layout.tsx` | umami script base URL (script renders only if set **and** website ID set) |
| `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` | client | `layout.tsx` | umami website id                                                          |
| `PORT`                             | server | `pnpm start` | optional port override (Next reads it natively)                           |

Secrets are never needed — there is no backend data access.

## 9. Gotchas

- **`.next/` type cache:** after deleting routes/files, stale generated types in `.next/types/validator.ts` can make `pnpm check` fail with "Cannot find module '../../src/app/…'". Fix: `rm -rf .next` (or rebuild) — it is cache, not source.
- **Port collisions:** `next start` fails with `EADDRINUSE` if another server holds the port; check `lsof -nP -iTCP:<port> -sTCP:LISTEN` when smoke tests return unexpected bodies (a stale server may be answering).
- **Global button styles:** `globals.css` styles all buttons (transition, active scale) — bespoke buttons in `page.tsx`/`not-found.tsx` rely on this; don't double up transitions.
- **Chat demo is fake:** `sendMessage()` never calls a network endpoint; keep it that way until a real backend exists.
- **`next dev` regenerates the AGENTS.md agent-rules block** — expected, commit it.
- **`gsap.from()` + CSS transitions corrupt end states** — buttons (global transition in `globals.css`) freeze at the from-state even at tween progress 1. Use `fromTo` with explicit values everywhere (§4.3.1).
- **ScrollTrigger percentage starts can be unreachable** — elements at the very bottom of the document (the footer) can never scroll their top up to `top 88%`; use `start: "top bottom"` for blocks near the document end.
- **Never use `scroll-behavior: smooth` on `html`/`body` with ScrollTrigger** — browser-level scroll interpolation desyncs scroll events from GSAP ticker frames and causes visual latency during fast scrolls or direction reversals.
- **Reveals + fast scrolling:** `once` reveals start elements at `autoAlpha: 0`. To prevent delays or blank spaces during fast scrolling in either direction, use earlier triggers (`top 95%`), snappy durations (0.35–0.45s), `fastScrollEnd: 350`, a 300px `IntersectionObserver` lookahead, and the bidirectional velocity manager (§4.3.1).
- **`clearProps` on entrance tweens is mandatory** — GSAP leaves inline `transform`/`opacity` that override Tailwind hover/active utilities; pass `clearProps: "all"` (and `"backgroundColor"` for color-flash tweens).
- **A stale server may own port 3000** — background `next dev`/`next start` processes can survive across sessions; `lsof -nP -iTCP:3000 -sTCP:LISTEN` before trusting smoke-test output. Background processes started with shell `&` inside a tool command may also die with the shell — prefer a dedicated background process.

## 10. Conventions

- Route handlers always `route.ts`; pages always `page.tsx` under `src/app/`.
- Client-side env vars require the `NEXT_PUBLIC_` prefix.
- Path alias `@/*` → `src/*` (the former `@shared/*` alias and `shared/` directory were removed).
- No state library, no context besides the provider stack above, no custom hooks directory — introduce one only on a real reuse need.

## 11. Change log (major)

- **2026-10-20 — Comprehensive bidirectional fast-scroll fix.** Resolved issue where fast scrolling (downwards or upwards) caused content to load with a delay. Root causes identified: CSS `html { scroll-behavior: smooth; }` causing browser-level scroll desync with ScrollTrigger; hero content scrub fadeout (`autoAlpha: 0`) and 1s card scrub lag causing blackouts when scrolling up; late section triggers (`top 85%`) with 0.9s lateral slides; and a dormant 1500px/s unidirectional guard. Fixed by removing CSS root smooth-scrolling, updating hero parallax to non-blocking opacity (`opacity: 0.35`, `scrub: 0.3`), tuning reveals to early triggers (`top 95%`, 0.35–0.45s, `fastScrollEnd: 350`), and deploying a bidirectional instant visibility manager with 300px IntersectionObserver lookahead, velocity thresholding (>180px/s, >700px/s), reverse scroll instant completion, and programmatic pre-reveals in `scrollTo()`. Verified via `pnpm check` and `pnpm build`. See §4.3.1.
- **2026-10-20 (pm) — Fast-scroll visibility fix.** Reported bug: content/text invisible ~0.5–1s after fast scrolls. Root cause: `once` reveals start from `autoAlpha:0` and only begin when their ScrollTrigger start line crosses — a fling triggers them while they're already on screen, so they stay hidden for their full 0.5–0.9s + stagger (measured up to 15 in-viewport elements at opacity 0 for 1.5–2.5s). Fix: `fastScrollEnd: true` on all six reveal types + a velocity-hysteresis guard in `page.tsx`'s `useGSAP` block (arm >1500px/s, stays armed until 0.25s of rest, snaps in-flight entrance tweens to `progress(1)` and pre-completes arrived-but-untriggered ones). Worst case now 0 hidden by ~1.0s; slow reveals unaffected. See §4.3.1.

- **2026-10-20 — Motion layer + hero background rework.** Added `gsap` + `@gsap/react`. `page.tsx` gained a scoped `useGSAP` motion layer (§4.3.1): hero entrance timeline, scroll-scrubbed parallax, pointer-reactive headline + card tilt, per-section reveals with bounce staggers, off-screen title slides, language-tile lime flash, hover pops, ring drift — all driven by `data-*` attributes and all `fromTo` + `clearProps` (see the `from()` gotcha). New `ui/beams-background.tsx`: sprite-baked canvas beams (40fps cap, viewport/visibility pause, reduced-motion static frame) layered above the hero scrim; `/hero.svg` faded to `opacity-[0.14]`. Header reworked into a floating inset glass bar (rounded corners, no divider). Fixed the footer reveal never firing (unreachable `top 88%` ScrollTrigger start → `top bottom`). Verified in prod + dev (StrictMode) at 1440px and 390px via CDP opacity probes, and under emulated `prefers-reduced-motion`.

- **2026-10-19 — Manus removal + minimization.** Deleted: `/api/manus-logs` (dev debug-log sink), `/manus-storage/[...key]` (Forge presign→307 proxy), `public/__manus__/debug-collector.js`, the dev script injection in `layout.tsx`, `.manus-logs/`, `ManusDialog.tsx` (never mounted), `Map.tsx` (never mounted), `hooks/` (`useComposition`, `useMobile`, `usePersistFn`), `contexts/ThemeContext.tsx` (dark-only site), `src/const.ts` (`getLoginUrl()` Manus OAuth helper), `shared/` (`COOKIE_NAME`, `ONE_YEAR_MS`), and 52 of 53 shadcn/ui components (kept `ui/sonner.tsx`). Dependencies pruned from ~80 to 7 runtime + 8 dev (removed all Radix, react-hook-form, zod, recharts, next-themes, tw-animate-css, vitest, etc.). Hero image and favicon — previously resolved through the Manus storage proxy and therefore **broken outside the Manus platform** — were replaced with local `public/hero.svg` and `public/favicon.svg`. The 404 page was restyled from the light template to the dark lingo design. `ThemeContext`/`next-themes` removal means the sonner Toaster is pinned to `theme="dark"`.
- **2026-10-17 — Vite/Express → Next.js 16 migration.** `client/` + Express `server/` collapsed into the App Router at the repo root; wouter replaced by file-system routing; env vars renamed `VITE_*` → `NEXT_PUBLIC_*`. (All Manus pieces ported in that migration were removed two days later — see above.)
