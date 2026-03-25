# Technical Concerns

**Analysis Date:** 2026-03-25

## High Priority Concerns

### 1) Large, multi-responsibility modules

- `backend/src/routes/pdfRoutes.ts` (~349 lines) mixes request handling, layout calculation, formatting rendering, and multi-mode PDF logic.
- `backend/src/routes/playlistRoutes.ts` (~306 lines) combines CRUD, duplication, and nested relationship operations.
- `frontend/src/pages/PlaylistDetailPage.tsx` (~487 lines) centralizes many UI responsibilities.

**Impact:** hard-to-test behavior, fragile edits, and regression risk during feature work.

**Fix approach:** extract domain services/helpers per concern and keep route/page files orchestration-focused.

### 2) No automated regression suite

- No unit/integration/E2E tests detected.
- Critical business logic (transposition, lyric parsing, PDF generation) lacks executable safety net.

**Impact:** high risk of silent regressions in music formatting and export workflows.

**Fix approach:** introduce minimal test baseline for utility logic first, then route contracts.

### 3) Debug logging and user alerts in production paths

- Frequent `console.log` traces in UI and API routes (for example `frontend/src/pages/CreateSongPage.tsx`, `frontend/src/components/RichTextEditor.tsx`, `backend/src/routes/songRoutes.ts`).
- Multiple blocking `alert(...)` calls for error/success feedback.

**Impact:** noisy logs, poor UX consistency, and difficult telemetry filtering.

**Fix approach:** centralize logging policy and replace alerts with non-blocking notification component.

## Medium Priority Concerns

### 4) Mixed query strategies and typed-safety erosion

- API list/search uses both Prisma model methods and `prisma.$queryRaw`.
- Cast-heavy patterns (`parseInt(skip as string)`, `const playlistIds: any[]`) reduce type guarantees.

**Impact:** higher maintenance burden and greater chance of subtle runtime bugs.

**Fix approach:** move search queries to typed Prisma filters where possible and encapsulate parse/validation helpers.

### 5) Authentication/authorization not present

- No auth middleware, token validation, or role-based checks detected.

**Impact:** deployment outside trusted network can expose full CRUD and file-processing endpoints.

**Fix approach:** define auth boundary and enforce endpoint protection before public exposure.

### 6) Heavy compute endpoints execute inline

- OCR (`/api/ocr/extract`) and PDF generation (`/api/pdf/generate`) run in request lifecycle.

**Impact:** latency spikes and potential request timeout/resource contention under load.

**Fix approach:** add execution guards (timeouts/limits), and consider queued/offline processing for heavier tasks.

## Low Priority Concerns

### 7) Monorepo `shared/` package currently underused

- Workspace includes `shared` but code scan did not detect active shared-domain usage.

**Impact:** duplicated types/utilities may emerge across backend and frontend.

**Fix approach:** use `shared/` for DTO contracts and pure transposition/parsing types where cross-tier parity matters.

### 8) Backend lint/format consistency unclear

- Frontend has ESLint config; backend lint configuration was not detected in scanned files.

**Impact:** style drift and inconsistent static checks across server code.

**Fix approach:** add backend lint rules and align scripts across workspaces.

## Priority Backlog Candidates

1. Extract `pdfRoutes` core rendering logic into dedicated service modules.
2. Add first automated tests for `transposeUtils` and `lyricsParser`.
3. Standardize error handling and remove ad-hoc alerts/logging in UI.
4. Introduce auth layer for non-local environments.
5. Harmonize query strategy and tighten type boundaries around pagination/search.

---

*Concerns analysis: 2026-03-25*
