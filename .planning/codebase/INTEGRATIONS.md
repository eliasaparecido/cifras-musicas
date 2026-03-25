# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**HTTP API (internal frontend-backend integration):**
- Backend REST API consumed by frontend
  - Client: `axios` wrapper in `frontend/src/lib/api.ts`
  - Base URL: `VITE_API_URL` (fallback `http://localhost:3002/api`)
  - Auth: Not detected (no token middleware or auth headers)

**OCR Service (local library integration):**
- Tesseract OCR processing for uploaded images
  - Library: `tesseract.js` in `backend/src/routes/ocrRoutes.ts`
  - Upload handling: `multer` memory storage
  - Auth: Not applicable (no external API key)

**PDF Rendering Engine (local library integration):**
- Playlist PDF generation
  - Library: `jspdf` in `backend/src/routes/pdfRoutes.ts`
  - Output consumed by frontend as blob download (`frontend/src/services/playlistService.ts`)
  - Auth: Not applicable

## Data Storage

**Databases:**
- SQLite
  - Connection: `DATABASE_URL` env var (`file:/app/prisma/dev.db` in compose)
  - ORM/client: Prisma (`backend/src/db/prisma.ts`)
  - Schema: `backend/prisma/schema.prisma`

## Network & Service Boundaries

**Backend service:**
- Exposes HTTP on port `3002`
- Health endpoint: `GET /health` (`backend/src/server.ts`)
- Route groups:
  - `/api/songs`
  - `/api/playlists`
  - `/api/pdf`
  - `/api/ocr`

**Frontend service:**
- Vite dev server on port `5173`
- Uses browser requests to backend API URL configured via env

## Local Infrastructure Integrations

**Container orchestration:**
- Docker Compose orchestrates frontend and backend in `cifras-network`
- Bind mounts for live development and node_modules volumes
- Backend healthcheck via `curl http://localhost:3002/health`

## Authentication & Authorization

- Not detected: no login routes, JWT middleware, session middleware, OAuth provider, or ACL layer in current codebase scan.
- Implication: API appears open within trusted local/deployed environment.

## Webhooks / Async Messaging

- Not detected: no webhook endpoints, queue brokers, or pub/sub integrations.

## Integration Risk Notes

- Frontend-backend contract is string-path based and manually maintained (`/songs`, `/playlists`, `/pdf/generate`, `/ocr/extract`).
- OCR and PDF processing run in backend request cycle, which can increase latency for heavy inputs.
- No explicit timeout/retry/circuit-breaker patterns detected in API client layer.

---

*Integration analysis: 2026-03-25*
