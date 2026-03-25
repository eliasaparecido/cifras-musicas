# Coding Conventions

**Analysis Date:** 2026-03-25

## Language and Type System Rules

- Use TypeScript for all application modules in `backend/src/` and `frontend/src/`.
- Keep strict type-checking enabled (`"strict": true`) in both backend and frontend TS configs.
- Favor explicit DTO/type declarations from `frontend/src/types/index.ts` for service APIs.
- Allow `any` only when integrating with untyped third-party result shapes; prefer narrowing as soon as possible.

## Backend Patterns

- Define route handlers in resource-specific files under `backend/src/routes/`.
- Validate request payloads with `zod` at route boundaries (`songRoutes.ts`, `playlistRoutes.ts`).
- Use Prisma client from shared singleton `backend/src/db/prisma.ts`.
- Return JSON consistently for success and error payloads.
- Handle exceptions with local try/catch and `res.status(...)` responses.

## Frontend Patterns

- Keep endpoint access in `frontend/src/services/` and share base client in `frontend/src/lib/api.ts`.
- Keep route registration centralized in `frontend/src/App.tsx`.
- Use page components (`frontend/src/pages/`) for screen-level orchestration.
- Use reusable UI components (`frontend/src/components/`) for shared visual/interaction blocks.

## Naming Conventions

- Backend module filenames: camelCase (`transposeUtils.ts`, `songRoutes.ts`).
- Frontend page/component filenames: PascalCase (`SongsPage.tsx`, `RichTextEditor.tsx`).
- Service object exports: lower camelCase (`songService`, `playlistService`).
- API route segments: plural nouns and nested resource paths (`/playlists/:id/songs`).

## Error Handling Conventions

- Use user-readable Portuguese messages in API errors and UI alerts.
- Log unexpected errors with `console.error` before returning `500`.
- Preserve `404` and `400` semantics for not-found and validation errors.

## Formatting and Linting

- Frontend lint config uses:
  - `eslint:recommended`
  - `plugin:@typescript-eslint/recommended`
  - `plugin:react-hooks/recommended`
- `react-refresh/only-export-components` is configured as warning in `frontend/.eslintrc.cjs`.
- No unified backend lint config detected in scanned files.

## Data Access and Querying Rules

- Prefer Prisma model operations for standard CRUD.
- Use `prisma.$queryRaw` only when needed for custom filtering/search behavior.
- Parse pagination query params before Prisma usage (`parseInt(skip as string)` pattern in route files).

## Suggested Enforcement Baseline

- Keep business transformations in utility modules (`backend/src/utils/`) instead of route body growth.
- Keep raw SQL isolated and documented in the same handler.
- Keep HTTP path strings centralized through service wrappers, not directly in page components.

---

*Conventions analysis: 2026-03-25*
