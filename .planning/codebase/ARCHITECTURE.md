# Architecture

**Analysis Date:** 2026-03-25

## Architectural Pattern

- Monorepo with npm workspaces (`backend`, `frontend`, `shared`) coordinated by root scripts in `package.json`.
- Two-tier web application:
  - Backend: Express REST API + Prisma/SQLite persistence.
  - Frontend: React SPA using route-based screens and service wrappers.
- No explicit domain/service layer in backend; route handlers combine validation, data access, and business logic.

## Runtime Components

**Backend component:**
- Entry point: `backend/src/server.ts`
- Route modules:
  - `backend/src/routes/songRoutes.ts`
  - `backend/src/routes/playlistRoutes.ts`
  - `backend/src/routes/pdfRoutes.ts`
  - `backend/src/routes/ocrRoutes.ts`
- Utilities for lyrics processing/transposition and HTML formatting live under `backend/src/utils/`.

**Frontend component:**
- Entry point: `frontend/src/main.tsx`
- Router composition: `frontend/src/App.tsx`
- UI pages in `frontend/src/pages/`
- Shared UI pieces in `frontend/src/components/`
- API abstraction in `frontend/src/lib/api.ts` with endpoint wrappers in `frontend/src/services/`.

## Data Model and Persistence

- Prisma schema in `backend/prisma/schema.prisma` defines:
  - `Song`
  - `Playlist`
  - `PlaylistSong` (join model with playlist-specific key and order)
- Database provider: SQLite (`provider = "sqlite"`), URL from `DATABASE_URL`.
- Access pattern:
  - Mostly Prisma client operations (`findMany`, `create`, `update`, `delete`)
  - Selected list/search endpoints use `prisma.$queryRaw` for case-insensitive filtering.

## Request and Data Flow

1. Browser route renders page component (for example `PlaylistsPage`).
2. Page calls service method (for example `playlistService.getAll`).
3. Service uses shared axios instance (`frontend/src/lib/api.ts`).
4. Backend route validates input (often with Zod) and executes Prisma operations.
5. Response JSON is consumed by page state.
6. For PDF flow, backend returns file bytes and frontend triggers download.

## Cross-Cutting Patterns

- Validation: Zod schemas at route level in songs/playlists endpoints.
- Error handling:
  - Route-local try/catch with `res.status(500)`.
  - Global Express error middleware in `backend/src/server.ts`.
- Logging: `console.log`/`console.error` usage in both frontend and backend.
- CORS enabled globally (`app.use(cors())`).

## Entry Points and Operational Paths

- API health check: `GET /health`.
- Frontend dev server: Vite on `5173` (`frontend/vite.config.ts`).
- Backend dev server: TSX watch on `3002` (`backend/package.json`, `backend/src/server.ts`).
- Containerized local orchestration: `docker-compose.yml`.

## Architecture Guidance for Future Phases

- Keep new backend HTTP endpoints under `backend/src/routes/` and mount in `backend/src/server.ts`.
- Keep frontend network calls inside `frontend/src/services/` and avoid direct axios use in page components.
- Reuse utility modules under `backend/src/utils/` for lyrics/chord transformations to avoid logic duplication.
- Add shared validation/DTO modules if route files continue to grow in size and complexity.

---

*Architecture analysis: 2026-03-25*
