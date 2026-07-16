# Architecture -- Regulatory Intelligence PoC

**Status:** Implemented (Sprint 7)
**Date:** 16 July 2026

---

## 1. Current-State Architecture

```
Browser
  |
  v
React + Vite SPA (single-page application)
  |-- App.tsx (screen state management)
  |-- TopNav.tsx (navigation bar)
  |-- Dashboard.tsx (static KPIs and alerts)
  |-- SourceQueue.tsx (static queue data)
  |-- RegulationReview.tsx (static single-doc review)
  |-- RegulationReviewTable.tsx (static multi-source review)
  |-- SearchExport.tsx (static search/export)
  |-- kiaa-tokens.ts (design tokens)
  |-- KBadge.tsx (reusable badge)
  |
  [All data is inline static arrays/objects in component files]
  [No backend, no database, no API calls]
```

### Current Characteristics

- Single-page application with state-based screen switching (no URL routing)
- All data is hardcoded inside component files
- No separation between data layer and presentation
- No shared data model across screens
- Inline React styles (no Tailwind utility classes in application components)
- KIAA light theme defined in `kiaa-tokens.ts` and `theme.css`

## 2. Target PoC Architecture

```
Browser
  |
  v
React + Vite SPA
  |-- React Router (URL-based navigation)
  |-- Screens (Dashboard, SourceQueue, Review, Search)
  |-- Shared components (TopNav, Badge, etc.)
  |-- Service / repository layer (API client)
  |
  | HTTP (localhost)
  v
FastAPI backend (Python)
  |-- REST API endpoints
  |-- Business logic layer
  |-- Database access layer (SQLAlchemy / raw SQL)
  |
  v
SQLite database (local file)
  |-- Sources, Regulations, Fields, Evidence
  |-- Review decisions and comments
  |-- Export job records
  |
  [Seeded from imported Tamarind outputs]
```

## 3. Frontend Responsibilities

- **Presentation:** Render all screens using the KIAA light theme
- **Navigation:** React Router with URL paths for each screen
- **Data fetching:** Call backend API via service/repository layer
- **State management:** Local component state supplemented by a shared data context or lightweight store for cross-screen data (e.g., source list, regulation list)
- **User interactions:** Editing fields, accepting/flagging, filtering, searching, exporting
- **Evidence display:** Highlight source text linked to selected extracted field
- **Export initiation:** Request export from backend, download resulting file

### Proposed Frontend Folder Structure

```
src/
  main.tsx
  app/
    App.tsx
    routes.tsx                    # React Router route definitions
    components/
      TopNav.tsx
      KBadge.tsx
      kiaa-tokens.ts
      figma/
        ImageWithFallback.tsx
      ui/                         # shadcn/ui components (retained for potential future use)
    screens/
      Dashboard.tsx
      SourceQueue.tsx
      RegulationReview.tsx
      RegulationReviewTable.tsx
      SearchExport.tsx
    services/
      api.ts                      # API client (fetch wrapper)
      sources.ts                  # Source-related API calls
      regulations.ts              # Regulation-related API calls
      evidence.ts                 # Evidence-related API calls
      search.ts                   # Search API calls
      exports.ts                  # Export API calls
    types/
      index.ts                    # Shared TypeScript interfaces
    data/
      mock.ts                     # Extracted mock data (used before backend exists)
  styles/
    index.css
    tailwind.css
    theme.css
```

## 4. Backend Responsibilities

- **REST API:** Serve data to the frontend via JSON endpoints
- **Business logic:** Validate review decisions, manage status transitions, compute dashboard metrics
- **Data access:** Read/write SQLite database
- **Import:** Ingest Tamarind extraction outputs into the database
- **Export:** Generate CSV/Excel files from approved records with evidence
- **No AI:** The backend does NOT perform extraction or summarisation

### Proposed Backend Folder Structure

```
backend/
  main.py                         # FastAPI application entry point
  config.py                       # Configuration (DB path, CORS origins)
  database.py                     # SQLite connection and session management
  models/
    source.py
    regulation.py
    field.py
    evidence.py
    review.py
    export.py
  routes/
    health.py
    dashboard.py
    sources.py
    regulations.py
    evidence.py
    search.py
    exports.py
  services/
    import_service.py             # Tamarind output ingestion
    export_service.py             # CSV/Excel generation
    review_service.py             # Review workflow logic
  seed/
    sample_data.py                # Demo data seeder
```

## 5. Persistence Responsibilities

- **SQLite** is the sole persistence mechanism for the PoC
- Database file stored locally (e.g., `backend/data/regulatory_intel.db`)
- Schema managed via simple migration scripts or initial DDL
- No ORM required initially; raw SQL or lightweight SQLAlchemy Core is acceptable
- Seed script populates demo data matching current UI mock data

## 6. Evidence Traceability Approach

Every extracted regulatory field maintains a chain of evidence:

```
Source Document (original text, language, URL/reference)
  -> Extraction Output (Tamarind result)
    -> RegulatoryField (extracted value, field name, category)
      -> Evidence (source text excerpt, line reference, confidence score)
        -> ReviewDecision (accepted/flagged/pending, reviewer, timestamp)
```

Key principles:
- Evidence records are immutable once imported
- Review decisions are additive (new decision records, not overwrites)
- Source documents are stored as text with metadata (language, type, origin)
- The UI highlights source text segments corresponding to each field's evidence

## 7. Separation: Imported Results vs. Future AI Extraction

| Concern                | PoC Scope                                  | Future                         |
|------------------------|--------------------------------------------|--------------------------------|
| Data source            | Imported Tamarind outputs (JSON/CSV files) | Live Tamarind pipeline         |
| Extraction logic       | None -- results are pre-computed           | AI extraction service          |
| Confidence scores      | Imported from extraction output            | Computed by AI model           |
| Evidence linking       | Imported source text + line references     | Automated span extraction      |
| Translation            | Imported translations where available      | Translation service            |

The import service (`import_tamarind.py`) reads Tamarind output files (Excel) and creates database records. It does not invoke any AI model. It is invoked via CLI: `python -m backend.import_tamarind --input <path>`.

## 8. Development and Production-like Local Startup Flow

### Development

```bash
# Terminal 1 -- Frontend
cd "D:\Regulatory Intelligence"
pnpm install
pnpm run dev          # Vite dev server on http://localhost:5173

# Terminal 2 -- Backend (when implemented)
cd "D:\Regulatory Intelligence\backend"
pip install -r requirements.txt
python main.py        # FastAPI on http://localhost:8000
```

### Production-like Local Build

```bash
# Frontend
pnpm run build        # Output to dist/
npx serve dist        # Serve static files

# Backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Demo Data Seeding

```bash
cd backend
python -m seed.sample_data    # Populates SQLite with demo records
```

## 9. Key Architectural Decisions and Trade-offs

| Decision                                  | Rationale                                                    |
|-------------------------------------------|--------------------------------------------------------------|
| SQLite over PostgreSQL                    | Local-first PoC; no server setup; single-file database       |
| FastAPI over Express/Node                 | Python aligns with Tamarind ecosystem; strong typing with Pydantic |
| React Router over state-based navigation  | URL-addressable screens; browser back/forward support        |
| Service layer in frontend                 | Clean separation allows swapping mock data for API calls     |
| No global state library (Redux, Zustand)  | PoC scale doesn't justify complexity; React context sufficient |
| Keep shadcn/ui components                 | Low risk to retain; may be useful for future UI components   |
| Inline styles preserved                   | Converting to Tailwind is a large refactor; defer            |
| Separate import from extraction           | Allows PoC progress without AI pipeline dependency           |
| Evidence immutability                     | Audit trail integrity; reviewer edits are separate records   |
