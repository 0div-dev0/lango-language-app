# lingo. — Conversation Language Learning

A conversation-first AI language-learning studio: practice speaking by chatting with an AI tutor, with inline translation, phrase saving, and contextual learning cues. Built with **Next.js 16 (App Router)**, React 19, TypeScript, and Tailwind CSS v4, styled in the "Midnight Atlas" direction (see `ideas.md`). Deliberately minimal dependencies.

## Commands

```bash
pnpm dev        # Next.js dev server (port 3000)
pnpm build      # Production build (.next/)
pnpm start      # Start the production server
pnpm check      # tsc --noEmit
pnpm format     # Prettier write
```

## Documentation

- **[AGENTS.md](./AGENTS.md)** — agent/contributor rules and the documentation contract
- **[DEVELOPER_CONTEXT.md](./DEVELOPER_CONTEXT.md)** — deep, living context of the whole codebase (read this first)
- **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)** — folder hierarchy and organization guidelines

## API

Backend endpoints live as Next.js route handlers under `src/app/api/` (e.g. `GET /api/health`). See `PROJECT_ARCHITECTURE.md` §4 for conventions.
