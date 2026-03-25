# Testing Practices

**Analysis Date:** 2026-03-25

## Framework Detection

- Automated test framework config not detected:
  - No `jest.config.*`
  - No `vitest.config.*`
  - No `*.test.*` or `*.spec.*` files in workspace scan

## Current Validation Strategy

- Heavy reliance on manual verification and feature docs (`teste-manual.md`, feature markdown files at root).
- Route-level input validation via `zod` acts as runtime guardrails (not test replacement).
- One ad-hoc script exists for formatting inspection: `backend/test-formatting.js`.

## Existing Test-Like Assets

- `backend/test-formatting.js` prints predefined formatting scenarios for manual inspection.
- Documentation-driven scenarios likely guide regressions (`TESTE-NEGRITO.md`, `FEATURE-*.md`, `RESPONSIVIDADE-IMPROVEMENTS.md`).
- Make/Docker flow supports running scripts inside containers (`Makefile`).

## Gaps

- No unit tests for chord transposition/parsing logic in:
  - `backend/src/utils/transposeUtils.ts`
  - `backend/src/utils/lyricsParser.ts`
  - `frontend/src/utils/transposeUtils.ts`
- No API integration tests for route contracts in `backend/src/routes/`.
- No component tests for UI-heavy flows (editor, modals, PDF preview).
- No E2E test pipeline covering OCR upload and PDF generation journeys.

## Recommended Test Structure

- Backend unit tests:
  - Place under `backend/src/**/*.test.ts` near utilities and parser logic.
  - Prioritize deterministic transposition and normalization functions.
- Backend integration tests:
  - Add route tests for songs/playlists/PDF/OCR API contracts.
- Frontend unit/component tests:
  - Add tests for service adapters and complex components (`RichTextEditor`, playlist modals).
- End-to-end tests:
  - Cover create song, transpose, add to playlist, generate PDF with/without chords.

## Minimum Coverage Priorities

1. Chord transposition correctness matrix across major/minor keys.
2. Lyrics normalization and chord-removal behavior for mixed-format inputs.
3. Playlist song ordering and duplicate playlist behavior.
4. PDF generation API response and basic content assertions.
5. OCR endpoint request validation and failure behavior.

## CI/CD Testing State

- No CI pipeline or test command orchestration detected in scanned files.
- Build and run scripts exist, but no `test` script in root/frontend/backend package manifests.

---

*Testing analysis: 2026-03-25*
