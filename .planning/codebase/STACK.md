# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- TypeScript (frontend and backend application code) - `frontend/src/**/*`, `backend/src/**/*`

**Secondary:**
- JavaScript (utility and migration/testing scripts) - `backend/test-formatting.js`, `backend/migrate-lyrics.js`
- SQL (Prisma-generated and raw queries) - `backend/prisma/schema.prisma`, raw SQL in route handlers

## Runtime

**Environment:**
- Node.js >=18 (workspace engine requirement) - `package.json`

**Package Manager:**
- npm workspaces (`backend`, `frontend`, `shared`) - `package.json`
- Lockfile: present (`package-lock.json` expected in npm workspace flow)

## Frameworks

**Core:**
- Express 4 (REST API server) - `backend/src/server.ts`
- React 18 (SPA UI) - `frontend/src/main.tsx`, `frontend/src/App.tsx`
- Prisma 5 (ORM and schema management) - `backend/prisma/schema.prisma`, `backend/src/db/prisma.ts`

**Testing:**
- Not detected (no Jest/Vitest config in workspace)

**Build/Dev:**
- Vite 5 (frontend dev/build) - `frontend/vite.config.ts`
- TypeScript compiler (`tsc`) for backend and frontend build steps - `backend/package.json`, `frontend/package.json`
- TSX (backend dev runner and seed/migration scripts) - `backend/package.json`
- Docker Compose (local multi-service runtime) - `docker compose.yml`

## Key Dependencies

**Critical:**
- `@prisma/client` + `prisma` - database access and migrations
- `express` + `cors` - HTTP API and cross-origin support
- `react`, `react-dom`, `react-router-dom` - UI rendering and routing
- `axios` - frontend API client layer (`frontend/src/lib/api.ts`)

**Infrastructure:**
- `better-sqlite3` - SQLite driver in Node runtime
- `zod` - request payload validation in API routes
- `jspdf` - server-side PDF generation for playlists
- `tesseract.js` + `multer` - OCR upload/processing pipeline
- `tailwindcss` + `postcss` + `autoprefixer` - frontend styling toolchain

## Configuration

**Environment:**
- Backend uses `PORT` and `DATABASE_URL` (SQLite file URL) - `docker compose.yml`, `backend/prisma/schema.prisma`
- Frontend uses `VITE_API_URL` - `frontend/src/lib/api.ts`, `docker compose.yml`

**Build:**
- Backend TypeScript config: `backend/tsconfig.json`
- Frontend TypeScript config: `frontend/tsconfig.json`, `frontend/tsconfig.node.json`
- Frontend bundler config: `frontend/vite.config.ts`
- Lint config: `frontend/.eslintrc.cjs`

## Platform Requirements

**Development:**
- Node.js 18+ and npm 9+
- Docker and Docker Compose for containerized local workflow (`make up`, `make migrate`)

**Production:**
- Container deployment model implied by `backend/Dockerfile`, `frontend/Dockerfile`, and `docker compose.yml`

---

*Stack analysis: 2026-03-25*
