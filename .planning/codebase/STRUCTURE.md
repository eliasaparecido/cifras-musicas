# Project Structure

**Analysis Date:** 2026-03-25

## Top-Level Layout

- `backend/` - Express API, Prisma schema/migrations, utilities
- `frontend/` - React application (Vite + TypeScript + Tailwind)
- `shared/` - Workspace package placeholder (currently no mapped source usage)
- `docker compose.yml` - local service orchestration
- `Makefile` - frequent developer commands
- `README.md`, `QUICKSTART.md`, `DEVELOPMENT.md` - operational and feature docs

## Backend Directory Map

- `backend/src/server.ts` - API bootstrap, middleware, route mounting, healthcheck
- `backend/src/db/prisma.ts` - Prisma client singleton
- `backend/src/routes/` - HTTP route handlers grouped by bounded context
- `backend/src/utils/` - lyric parsing, transposition, HTML conversion, migration helpers
- `backend/prisma/schema.prisma` - data model
- `backend/prisma/migrations/` - migration history

## Frontend Directory Map

- `frontend/src/main.tsx` - React root and router provider
- `frontend/src/App.tsx` - route table and layout composition
- `frontend/src/pages/` - route-level screens
- `frontend/src/components/` - reusable UI and modal/editor components
- `frontend/src/lib/api.ts` - shared axios client
- `frontend/src/services/` - backend endpoint wrappers
- `frontend/src/types/index.ts` - API and domain TS types
- `frontend/src/utils/transposeUtils.ts` - frontend transposition helpers

## Naming and Organization Conventions

- Backend files use camelCase names for modules (`songRoutes.ts`, `lyricsParser.ts`).
- Frontend pages/components use PascalCase filenames (`CreateSongPage.tsx`, `Layout.tsx`).
- Service modules expose singleton-like objects (`songService`, `playlistService`).
- API routes follow resource-oriented paths (`/songs`, `/playlists`) with nested routes for relationship operations.

## Where to Add New Code

**New backend endpoint:**
- Add handler in a focused file under `backend/src/routes/`.
- Mount route prefix in `backend/src/server.ts`.
- Use `zod` schema in the same route module for payload validation.

**New backend utility/domain transformation:**
- Add pure/helper logic under `backend/src/utils/`.
- Import utility into route module rather than embedding complex transformation logic inline.

**New frontend screen:**
- Create page in `frontend/src/pages/`.
- Register route in `frontend/src/App.tsx`.
- Use services from `frontend/src/services/` for API communication.

**New frontend reusable UI:**
- Add component in `frontend/src/components/`.
- Keep side effects and data-fetching in page layer when possible.

## Build and Tooling Files

- Frontend: `frontend/vite.config.ts`, `frontend/postcss.config.cjs`, `frontend/tailwind.config.js`, `frontend/.eslintrc.cjs`.
- Backend: `backend/tsconfig.json`, Prisma scripts in `backend/package.json`.
- Workspace root: scripts for concurrent start/build in `package.json`.

## Structural Hotspots

- Large page components in `frontend/src/pages/` and heavy route files in `backend/src/routes/` indicate candidate modules for extraction.
- PDF and transposition logic are algorithmically dense and concentrated in few files (`backend/src/routes/pdfRoutes.ts`, `backend/src/utils/transposeUtils.ts`).

---

*Structure analysis: 2026-03-25*
