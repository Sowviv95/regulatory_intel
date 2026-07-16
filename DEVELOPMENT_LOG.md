# Regulatory Intelligence – Development Log

This document tracks the functional changes, architectural decisions, sprint outputs, validation results, and known issues for the Regulatory Intelligence prototype.

## Project Information

- Repository: https://github.com/Sowviv95/regulatory_intel
- Local folder: D:\Regulatory Intelligence
- Frontend source: Figma Make export
- Package manager: pnpm
- Current phase: Sprint 1 — Routing and shared data layer

---

## Change Log

### Baseline – Figma UI Import

**Date:** 15 July 2026

**Status:** Completed

**Summary**
- Imported the Regulatory Intelligence user interface generated through Figma Make.
- Established the initial React/Vite frontend structure.
- No backend or persistent application functionality has been added yet.

**Included**
- Existing UI screens and components
- Figma-generated styles and theme
- Initial navigation structure
- Static prototype data

**Not yet implemented**
- Backend API
- Database persistence
- Source ingestion
- Regulatory document processing
- Search functionality
- Export functionality
- Authentication
- AI extraction or summarisation

---

### Sprint 0 -- Audit and Documentation

**Date:** 15 July 2026

**Status:** Completed

**Objective**
Audit the existing Figma-exported codebase, document the PoC requirements, architecture, data model, API contract, sprint plan, and demo runbook. Establish a clean development baseline before functional implementation begins.

**Audit summary**
- 5 screens: Dashboard, Source Queue, RegulationReview, RegulationReviewTable, SearchExport
- Navigation via state-based screen switching in App.tsx (no router)
- All data is inline static arrays/objects (~200 lines across 4 components)
- 47 shadcn/ui components installed but none imported by application code
- Sidebar.tsx and ImageWithFallback.tsx exist but are unused
- KIAA light theme (green accent #16a34a) defined in kiaa-tokens.ts
- Build succeeds on Windows ARM64 (~1.5s, 258 KB JS, 85 KB CSS)
- Multiple heavy dependencies installed but not visibly used (MUI, react-dnd, recharts, etc.)

**Files added**
- docs/CODEBASE_AUDIT.md
- docs/REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DATA_MODEL.md
- docs/API_CONTRACT.md
- docs/SPRINT_PLAN.md
- docs/DEMO_RUNBOOK.md

**Files modified**
- README.md (rewritten with project context, documentation links, structure)
- DEVELOPMENT_LOG.md (added Sprint 0 entry)

**Validation performed**
- `pnpm run build` -- succeeded, no errors
- `git status` -- only documentation files added/modified, no application code changed
- Visual inspection confirms no UI changes

**Decisions**
- Keep shadcn/ui components in place (low risk, may be used later)
- Keep unused Sidebar.tsx (reference for potential future use)
- Do not upgrade any dependencies in Sprint 0
- Use React Router in Sprint 1 for URL-based navigation
- Extract mock data to shared layer in Sprint 1
- Backend will be FastAPI + SQLite (Python aligns with Tamarind ecosystem)
- Evidence records will be immutable once imported

**Known limitations**
- No routing (browser back/forward does not work)
- All data resets on page reload
- React listed as peerDependency, not direct dependency
- pnpm.overrides in package.json is deprecated (should move to pnpm-workspace.yaml)
- Package name is still @figma/my-make-file

**Next steps**
- Sprint 1: Add React Router, extract mock data, create shared service layer

---

### Sprint 1 -- Routing and Shared Data Layer

**Date:** 15 July 2026

**Status:** Completed

**Objective**
Replace state-based navigation with React Router, extract inline mock data into domain-specific files, create shared TypeScript types and a service layer, and add minimal loading/empty/error/not-found states.

**Changes implemented**
- Replaced App.tsx state-based screen switching with React Router (BrowserRouter, Routes, Route)
- Added 7 routes: /, /sources, /sources/:sourceId, /regulations, /regulations/:regulationId, /search, * (not found)
- Updated TopNav to derive active state from current URL path via useLocation
- Created shared TypeScript types in src/types/index.ts
- Extracted all inline mock data from 4 components into src/data/ (dashboard.ts, sources.ts, regulations.ts, search.ts)
- Created mock-backed service layer in src/services/ (dashboard.ts, sources.ts, regulations.ts, search.ts)
- Source queue state now persists across navigations within the same session (in-memory mutable store in services/sources.ts)
- Source selector in RegulationReviewTable updates URL when switching sources
- Added NotFound component with 404 page and "Back to Dashboard" button
- Added "Regulation not found" empty state in RegulationReview
- Added "No sources available" empty state in RegulationReviewTable
- All components now import data from services, not directly from data files

**Files added**
- src/types/index.ts
- src/data/dashboard.ts
- src/data/sources.ts
- src/data/regulations.ts
- src/data/search.ts
- src/services/dashboard.ts
- src/services/sources.ts
- src/services/regulations.ts
- src/services/search.ts
- src/app/components/NotFound.tsx

**Files modified**
- src/app/App.tsx (router, removed state-based navigation)
- src/app/components/TopNav.tsx (useLocation/useNavigate, removed Screen prop)
- src/app/components/Dashboard.tsx (useNavigate, service imports)
- src/app/components/SourceQueue.tsx (useNavigate, service imports, in-memory state)
- src/app/components/RegulationReview.tsx (useParams, useNavigate, service imports, not-found state)
- src/app/components/RegulationReviewTable.tsx (useParams, useNavigate, service imports, URL updates)
- src/app/components/SearchExport.tsx (service imports)
- DEVELOPMENT_LOG.md (added Sprint 1 entry)

**Validation performed**
- `pnpm run build` -- succeeded, 1625 modules, 296 KB JS, 85 KB CSS
- `git diff --check` -- no whitespace errors (CRLF warnings only, Windows environment)
- `git diff --stat` -- 7 modified files, net -246 lines (data extraction)
- No changes to KIAA theme, design tokens, or visual layout

**Decisions**
- Source queue uses in-memory mutable array in service layer for session persistence
- RegulationReviewTable updates URL via navigate(replace: true) when switching sources
- TopNav active state uses pathname prefix matching (exact match for "/" only)
- Screen type retained in kiaa-tokens.ts for backward compatibility
- react-router already in package.json dependencies (no install needed)

**Known limitations**
- Only regulation ID 1 has detailed data for RegulationReview; other IDs show a clear error state
- Source queue state resets on page reload (in-memory only)
- Review field states (accept/flag) are local to the component, not persisted
- LoadingState component exists but is not actively triggered (mock services return synchronously)
- Browser hard-refresh on /sources/:id or /regulations/:id requires Vite SPA fallback (works in dev, needs server config for production)

**Sprint 1 addendum — State components and gitignore (15 July 2026)**
- Created reusable LoadingState, EmptyState, ErrorState components in src/app/components/StateViews.tsx
- RegulationReview shows ErrorState with source ID for invalid regulation IDs
- RegulationReviewTable shows ErrorState for invalid source IDs, EmptyState when no sources exist
- Added .claude/ to .gitignore

**Next steps**
- Sprint 2: Source Queue functionality (persistent state, status transitions)

---

### Sprint 2 -- Source Queue Functionality

**Date:** 15 July 2026

**Status:** Completed

**Objective**
Make the Source Queue a functional workflow with search, filters, sorting, row selection, bulk actions, source detail panel, and status transitions using the existing in-memory mock service layer.

**Changes implemented**
- Added text search across source title, publisher name, country, document type, and language
- Added filter dropdowns for Country and Document Type with dynamic option lists
- Added "All" status tab showing all sources regardless of status
- Added sortable columns (Country, Discovered) with asc/desc toggle
- Added row selection with checkboxes and select-all header checkbox
- Added bulk actions: Process Selected, Mark Irrelevant (shown when rows are selected)
- All action buttons are now functional: Process, Retry, Review, Mark Irrelevant, Restore, Details
- Added source detail slide-over panel showing: metadata, processing status, stage, regulation count, review-required count, processing timestamps, failure message
- Row click opens the detail panel; Review button navigates to /sources/:sourceId
- Status transitions update in-memory store: New -> Processing -> Ready for Review; any -> Irrelevant; Irrelevant -> New (Restore)
- Processing summary cards (Active Jobs, Ready for Review, Failures) are now computed from live data
- Dashboard KPIs (Pending Review, New This Week) now derive from live source counts
- Empty states distinguish between "no sources in this stage" and "no sources match your search"
- Selection clears after bulk actions
- Enhanced Source type with: title, regulationCount, reviewRequiredCount, startedAt, completedAt, failureMessage
- Source service: added getFilteredSources(), getSourceCountsByStatus(), getUniqueCountries(), getUniqueDocTypes(), bulkUpdateStatus()

**Files added**
- (none)

**Files modified**
- src/types/index.ts (added title, regulationCount, reviewRequiredCount, timestamps, failureMessage to Source)
- src/data/sources.ts (added new fields to all 12 source records)
- src/services/sources.ts (added search, filter, sort, bulk actions, count helpers)
- src/services/dashboard.ts (derives Pending Review and New This Week from live source data)
- src/app/components/SourceQueue.tsx (rebuilt with full functionality)
- src/app/components/Dashboard.tsx (call getDashboardData() per-render instead of module scope)
- DEVELOPMENT_LOG.md (added Sprint 2 entry)

**Validation performed**
- `pnpm run build` -- succeeded, 1626 modules, 309 KB JS, 87 KB CSS
- `git diff --check` -- no whitespace errors
- Manual: search filters results, country/type dropdowns filter, tabs filter by status, sorting toggles, row selection works, bulk process moves to Processing, bulk irrelevant discards, Process/Retry/Review/Restore/Details buttons functional, detail panel opens on row click, dashboard KPIs update after source status changes

**Decisions**
- Source detail is a slide-over panel rather than a separate route (matches existing UI pattern)
- Dashboard reads live source counts per render (no caching needed for PoC scale)
- Sort applies after text/status/filter so all constraints compose
- Bulk actions clear selection to prevent stale references
- "All" tab added to complement per-status tabs

**Known limitations**
- Source queue state still resets on page reload (in-memory only)
- Failure message field populated for no records in demo data (placeholder for Sprint 5+)
- Sort by "discovered" compares string values (correct for "Jul DD, YYYY" format in demo data)
- No pagination (12 records, no need yet)
- Detail panel doesn't update in real-time if the same source is modified while panel is open

**Next steps**
- Sprint 3: Regulatory Review workflow (shared review state, field accept/flag/edit)

---

### Sprint 3 -- Regulatory Review Workflow

**Date:** 15 July 2026

**Status:** Completed

**Objective**
Turn Regulation Review into a functional field-level review workflow with shared state across both the single-regulation detail view and the review table.

**Changes implemented**
- Created shared mutable review state in services/regulations.ts (Map keyed by sourceId)
- Both RegulationReview and RegulationReviewTable now read/write the same review store
- Added ReviewableField type with extractedValue, reviewedValue, status, comment, reviewedAt
- Added FieldStatus: Pending, Accepted, Rejected, Flagged (added Rejected)
- Field-level actions: Accept, Reject, Flag, Edit value, Add comment, Reset
- Accept All Pending button on both views
- Prev/Next regulation navigation is functional across all 6 review sources
- Unsaved-change protection via window.confirm when navigating with edit in progress
- Confidence indicators: High (>=90%, green), Medium (>=75%, amber), Low (<75%, red)
- Edited values show "(edited)" label; original extractedValue is preserved
- Comments displayed inline with blue MessageSquare icon
- Evidence panel shows per-field confidence bar with color coding
- RegulationReviewTable now shows 5 KPI cards (Total, Accepted, Rejected, Flagged, Review Rate)
- Source selector in table view shows review progress per source (e.g., "5/13 reviewed")
- Reject button added alongside Accept, Flag in both views
- Table View / Detail View buttons link between the two review screens
- All review state persists across navigation within a session
- Evidence remains immutable (read-only from data)

**Files modified**
- src/types/index.ts (added Rejected to FieldStatus, ReviewDecisionType, ReviewableField interface)
- src/services/regulations.ts (rebuilt with shared review store, all field-level action functions, aggregate stats)
- src/app/components/RegulationReview.tsx (rebuilt with full review workflow)
- src/app/components/RegulationReviewTable.tsx (rebuilt to use shared review state, added reject/comment)
- DEVELOPMENT_LOG.md (added Sprint 3 entry)

**Validation performed**
- `pnpm run build` -- succeeded, 1626 modules, 311 KB JS, 87 KB CSS
- `git diff --check` -- no whitespace errors
- Manual: Accept/Reject/Flag/Edit/Comment/Reset all functional in both views
- Cross-screen: changes in RegulationReview are visible in RegulationReviewTable and vice versa
- Prev/Next navigation works across all 6 sources
- Invalid regulation ID shows ErrorState
- Unsaved edit triggers confirmation dialog on navigation

**Decisions**
- Review state is a Map<sourceId, ReviewableField[]> in the service layer
- Fields are lazily initialized when first accessed for a source
- Rejected is a new distinct status (separate from Flagged) for explicit rejections
- Evidence is never modified; it's read from the immutable data layer
- Review stats (accepted, rejected, flagged, pending) computed on each read for simplicity

**Known limitations**
- Review state resets on page reload (in-memory only)
- Source text and evidence map are shared across all 6 sources (only accurate for source 1 / Taiwan)
- Highlight ranges in RegulationReview are hardcoded for the Taiwan source text
- No bulk reject or bulk flag (only Accept All Pending)
- Comments are single-value (replace, not append) -- will become a list in Sprint 5

**Next steps**
- Sprint 4: Search, evidence and export

---

### Sprint 4 -- Search, Evidence and Export

**Date:** 15 July 2026

**Status:** Completed

**Objective**
Make Search & Export (Intelligence Library) functional with live review data, evidence inspection, and CSV export.

**Changes implemented**
- Intelligence Library now shows field-level records from the live review store (not static data)
- Full-text search across: regulation title, source name, jurisdiction, document type, field name, extracted value, reviewed value, reviewer comment, evidence text, category
- Filters: Jurisdiction, Category (topic), Review Status, Confidence Level (High/Medium/Low), Source
- Sortable columns: Source/Jurisdiction, Field Name, Confidence, Status (click to toggle asc/desc/off)
- Clear-all filters button
- Row selection with checkboxes and select-all
- Final Value column shows reviewedValue when present, extractedValue otherwise, with "(edited)" indicator
- Evidence drawer (modal): shows source info, field details, extracted value, reviewed value (if different), immutable evidence text with green accent bar, confidence, status, reviewer comment
- Export summary modal: shows record counts (total, sources, accepted, rejected, flagged, pending, missing evidence warning)
- CSV export: generates and downloads a real CSV file with 16 columns
- Navigation links per row: Evidence (drawer), Detail View (/regulations/:id), Table View (/sources/:id)
- Empty state: "No records match your search or filters" vs "No field records available yet"
- Added SearchableRecord type combining source + field data with finalValue
- Search service now derives records from live review store via getFieldsForSource()
- Exported CSV includes: Source ID, Source Title, Regulatory Body, Jurisdiction, Document Type, Date, Field ID, Field Name, Category, Extracted Value, Reviewed Value, Final Value, Review Status, Confidence %, Reviewer Comment, Evidence Reference

**Files modified**
- src/types/index.ts (added SearchableRecord interface)
- src/services/search.ts (rebuilt with live data, field-level search, CSV generation, export summary)
- src/app/components/SearchExport.tsx (rebuilt with evidence drawer, export summary, full filters, sorting)
- DEVELOPMENT_LOG.md (added Sprint 4 entry)
- docs/SPRINT_PLAN.md (marked Sprint 4 completed)

**Validation performed**
- `pnpm run build` -- succeeded, 1626 modules, 317 KB JS, 87 KB CSS
- `git diff --check` -- no whitespace errors
- Manual: search filters results across all fields, combined filters compose correctly, sort toggles work, row selection works, evidence drawer shows immutable evidence, export summary shows correct counts, CSV downloads with all 16 columns, reviewed values take precedence over extracted values, navigation links work

**Known limitations**
- Saved views remain UI-only (static list, not functional)
- No Excel export (CSV only; Excel would require an additional dependency)
- Alert creation modal removed (not functional without backend)
- CSV includes UTF-8 BOM so non-English text (Chinese, Korean, etc.) opens correctly in Excel on Windows
- No pagination (78 total field records across 6 sources)

**Next steps**
- Sprint 5: FastAPI and SQLite persistence

---

### Sprint 5 -- FastAPI and SQLite Persistence

**Date:** 15 July 2026

**Status:** Completed

**Objective**
Add a FastAPI + SQLite backend and migrate the frontend from in-memory stores to persistent API-backed services.

**Phase 1 -- Backend**
- Created backend/ directory with modular FastAPI application
- SQLite database with 3 tables: sources, regulation_fields, review_decisions
- Seed script populates 12 sources and 78 fields (6 sources x 13 fields each)
- CORS configured for local Vite frontend (localhost:5173)
- 14 API endpoints implemented (health, dashboard, sources CRUD, regulations CRUD, review, search, evidence, export)
- Review decisions recorded in review_decisions audit table
- Evidence remains immutable (read-only)
- 28 backend tests covering all endpoints, CRUD, review workflow, search, export, persistence

**Phase 2 -- Frontend migration**
- Created api.ts client (get, patch, post, downloadFile helpers)
- Created useApi hook for async data loading with loading/error/reload
- All 4 service files rewritten to use API calls instead of in-memory stores
- Dashboard, SourceQueue, RegulationReview, RegulationReviewTable, SearchExport updated with async loading
- Loading and error states shown during API calls
- Source status changes, review actions, comments, and edits now persist to SQLite
- CSV export still works (client-side generation from API search results)

**Backend structure**
```
backend/
  main.py              # FastAPI app with lifespan, CORS
  database.py          # SQLite connection, schema DDL
  seed.py              # Demo data seeder
  requirements.txt     # fastapi, uvicorn, pydantic, pytest, httpx
  routers/
    health.py          # GET /api/health
    dashboard.py       # GET /api/dashboard
    sources.py         # GET/PATCH /api/sources, GET /api/sources/{id}/regulations
    regulations.py     # GET/PATCH /api/regulations, POST review, accept-all
    search.py          # GET /api/search, GET /api/evidence, POST /api/exports
  tests/
    test_api.py        # 28 tests
```

**Files added**
- backend/ (entire directory: main.py, database.py, seed.py, requirements.txt, routers/*, tests/*)
- src/services/api.ts (fetch-based API client)
- src/services/useApi.ts (async data loading hook)

**Files modified**
- .gitignore (added backend/data/, __pycache__/, *.pyc, .pytest_cache/)
- src/services/dashboard.ts (async API call)
- src/services/sources.ts (async API calls)
- src/services/regulations.ts (async API calls, kept static source text/evidence)
- src/services/search.ts (async API call, kept client-side CSV/sort)
- src/app/components/Dashboard.tsx (useApi hook, loading/error states)
- src/app/components/SourceQueue.tsx (useApi hook, async actions)
- src/app/components/RegulationReview.tsx (useApi hook, async actions)
- src/app/components/RegulationReviewTable.tsx (useApi hook, async actions)
- src/app/components/SearchExport.tsx (useApi hook, async search)
- DEVELOPMENT_LOG.md, docs/SPRINT_PLAN.md

**Validation performed**
- Backend tests: 28/28 passed
- `pnpm run build`: succeeded, 311 KB JS, 87 KB CSS
- `git diff --check`: no whitespace errors

**Known limitations**
- Source text and evidence map remain static (loaded from frontend data files, not from API)
- No authentication or authorization
- No migration framework (schema is created on startup)
- Comments are single-value per field (not a threaded list)
- Backend must be running for the frontend to work (no fallback to mock data)

**Next steps**
- Sprint 6: Tamarind output ingestion

**Sprint 5 addendum -- Schema alignment with domain model (16 July 2026)**
- Added `regulations` table between sources and fields (id, source_id, title, regulatory_body, jurisdiction, topic, summary, status, created_at, updated_at)
- Added `evidence` table (id, source_id, regulation_id, field_id, excerpt, page_number, section, source_reference, immutable)
- Updated `regulation_fields` to reference `regulation_id` (not only source_id)
- Seed creates 12 sources, 6 regulations, 78 fields, 78 evidence records
- Taiwan source text stored in sources.source_text column, served via API
- Evidence served read-only via GET /api/evidence/{field_id}; no write endpoints exist
- GET /api/sources/{id}/regulations now returns regulation records
- GET /api/regulations/{id} returns regulation with fields and embedded evidence
- Added dedicated field endpoints: GET/PATCH /api/fields/{id}, POST /api/fields/{id}/review
- Compatibility routes retained: POST /api/regulations/{id}/review, POST /api/regulations/{id}/review/accept-all
- Frontend regulation service rewritten to use /api/regulations/{id} for source text and evidence
- 32 backend tests passing, including relationship chain validation, persistence restart, and evidence immutability

---

### Sprint 6 -- Tamarind Output Ingestion

**Date:** 16 July 2026

**Status:** Completed

**Objective**
Import existing Tamarind extraction outputs into the FastAPI + SQLite application without rebuilding AI extraction.

**Stage 1 -- Discovery and mapping**
- Inspected 15+ files in the Tamarind archive (xlsx, docx)
- Identified `Merit_Tamarind Intelligence_POC_Batch 1_Sample Data_v1.0_08Apr2025.xlsx` as the primary import source
- 54 records across 5 jurisdictions: Poland (4), Denmark (9), UAE (15), Taiwan (13), South Korea (13)
- Mapped 15 Tamarind columns to the existing sources/regulations/fields/evidence schema
- Documented field format variations (structured dicts vs semicolon-delimited strings)
- Created docs/TAMARIND_IMPORT_MAPPING.md with full field mapping and dedup rules

**Stage 2 -- Import implementation**
- Created `backend/import_tamarind.py` -- idempotent CLI importer
- Supports `--dry-run`, `--reset-imported` flags
- Each Tamarind record creates: 1 source, 1 regulation, 12 fields, 12 evidence records
- Dedup by `external_url` (unique constraint on sources table)
- Import key: URL of the source document
- Origin tracking: `origin` column on sources and regulations ('seed' vs 'tamarind')
- Parsers for mixed product/type formats (structured dicts and plain text)
- Import summary with counts for created, skipped, errors
- Error report written to `backend/data/import_errors.json`

**Schema changes**
- Added `external_url TEXT` and `origin TEXT DEFAULT 'seed'` to sources table
- Added `origin TEXT DEFAULT 'seed'` to regulations table
- Added migration logic for existing databases (ALTER TABLE with exception handling)
- Added unique index on `sources(external_url)`

**Frontend changes**
- Review source catalogue (prev/next navigation, source selector) now fetched from API
- Search filter dropdowns (jurisdictions, source titles) now derived from live data
- Dashboard jurisdictions and alerts computed from actual database records
- All components handle async source loading with loading states

**Files added**
- backend/import_tamarind.py
- backend/tests/test_import.py (21 tests)
- docs/TAMARIND_IMPORT_MAPPING.md

**Files modified**
- backend/database.py (schema: external_url, origin columns; migration logic)
- backend/routers/dashboard.py (dynamic jurisdictions and alerts from DB)
- backend/tests/test_api.py (flexible dashboard assertions)
- src/services/regulations.ts (API-based review source catalogue)
- src/services/search.ts (data-driven jurisdiction/source lists)
- src/app/components/RegulationReview.tsx (async source loading)
- src/app/components/RegulationReviewTable.tsx (async source loading)
- src/app/components/SearchExport.tsx (data-driven filter dropdowns)
- README.md, DEVELOPMENT_LOG.md, docs/SPRINT_PLAN.md, docs/DATA_MODEL.md

**Validation performed**
- Dry run: 54 records parsed, 0 errors
- Import: 54 sources, 54 regulations, 648 fields, 648 evidence records created
- Idempotent re-import: all 54 records skipped, 0 duplicates
- Combined with seed data: 66 sources (12 seed + 54 tamarind), 60 regulations, 726 fields
- 53 backend tests passing (32 existing + 21 new import tests)
- Frontend build: succeeded, 292 KB JS, 87 KB CSS
- Reviewer edits survive re-import (verified by test)

**Decisions**
- Import only Batch 1 data (54 records, 5 jurisdictions) -- the QC-validated deliverable
- Albania and Moldova files deferred (different schema, not in Batch 1)
- Denmark Structured Output (165 rows) deferred (overlaps with Batch 1, no URL for dedup)
- Each Tamarind row produces 12 fields (mapped from its columns, not 13 like seed data which has separate Notice/Comment/Effective dates)
- Evidence excerpts = the extracted value itself (Batch 1 has no separate evidence text)
- Confidence scores assigned per field type from defaults (Batch 1 has relevance scores only in products/type fields)

**Known limitations**
- Batch 1 data has no original source text (source_text = NULL for imported records)
- No separate date fields (notice, comment deadline, effective) -- dates are a single free-text field
- Confidence scores are defaults per field type, not from extraction
- Albania and Moldova data not imported (different schema)
- Denmark Structured Output (165 rows) not imported (no URL column for dedup)

**Next steps**
- Sprint 7: Dashboard integration

---

### Sprint 7 -- Dashboard Integration

**Date:** 16 July 2026

**Status:** Completed

**Objective**
Make the Dashboard screen display real computed metrics from the database, including imported Tamarind records. All KPIs, jurisdiction breakdowns, review progress, and activity are derived from live data.

**Changes implemented**
- Rewrote GET /api/dashboard to compute all metrics from database queries
- Dashboard response now includes: kpis (4 cards with nav paths), stats (16 counters), jurisdictions, alerts (recent sources), recentActivity (review decisions), oldestPending (queue ageing)
- All metrics derived from live data: source counts by status, field counts by status, review rate, evidence coverage, low-confidence fields, Tamarind import counts
- KPI cards navigate to filtered Source Queue or Search screen on click
- Stats bar shows: Regulations, Accepted, Rejected, Flagged, Low Confidence, Evidence coverage -- each navigates to filtered Search
- Jurisdiction rows navigate to country-filtered Source Queue
- Queue Ageing panel shows oldest New/Ready for Review sources
- Recent Review Activity panel shows latest review decisions
- Refresh button reloads dashboard data
- Source Queue reads URL params: ?status=X, ?country=X for dashboard-driven navigation
- Search screen reads URL params: ?status=X, ?confidence=X for dashboard-driven navigation
- Removed all static/hardcoded dashboard values
- Empty database handled gracefully (zeros, empty lists)

**Files added**
- backend/tests/test_dashboard.py (14 tests)

**Files modified**
- backend/routers/dashboard.py (full rewrite)
- backend/tests/test_api.py (updated dashboard assertion)
- src/types/index.ts (DashboardStats, RecentActivity, OldestPending types; nav on KPI)
- src/app/components/Dashboard.tsx (full rewrite with live data, navigation, stats bar)
- src/app/components/SourceQueue.tsx (URL search params for initial filters)
- src/app/components/SearchExport.tsx (URL search params for initial filters)

**Validation performed**
- 67 backend tests passing (32 API + 14 dashboard + 21 import)
- `pnpm run build`: succeeded, 298 KB JS, 87 KB CSS
- Dashboard metrics reconcile with Source Queue and Search counts
- Card navigation applies correct filters
- Empty database returns valid response with zeros

**Decisions**
- Single GET /api/dashboard endpoint serves all metrics (avoids multiple frontend calls)
- KPI card nav paths use URL query params rather than React state
- Recent activity limited to 10 most recent review decisions
- Oldest pending limited to 5 items
- Alerts show 10 most recent sources (by ID, newest first)
- Evidence coverage = fields with evidence / total fields * 100

**Known limitations**
- Dashboard date display is not dynamically formatted (shows raw discovered date strings)
- No real-time refresh (manual Refresh button only)
- Filter dropdowns on dashboard header are decorative (not wired to backend filters)
- Queue ageing uses source ID order as proxy for age (no explicit queue timestamp)

**Next steps**
- Sprint 8: Demo hardening

---

### Sprint 8 -- Demo Hardening

**Date:** 16 July 2026

**Status:** Completed

**Objective**
Harden the PoC for a stable customer demo with repeatable setup, structured logging, error handling, and validated demo journey.

**Changes implemented**
- Removed decorative dashboard filter bar (Country/Status/Product/Date dropdowns that were not wired)
- Added "Original document text unavailable" placeholder for imported sources without source text
- RegulationReview now falls back to regulation API data when source is not in review cache
- Added React ErrorBoundary wrapping entire app
- Added loading spinner with disabled state on Dashboard Refresh button
- Renamed "Queue Ageing" to "Oldest Pending Sources" (accurate labelling)
- Added structured backend logging (startup counts, review actions, HTTP errors)
- Backend startup now logs database state: sources, regulations, fields, imported count
- Review field endpoint logs each decision
- Error-logging middleware for 4xx/5xx responses
- Added CSS spin animation for loading indicator

**Scripts added**
- scripts/start-backend.ps1 -- start backend with dependency check
- scripts/start-frontend.ps1 -- start frontend with dependency check
- scripts/start-demo.ps1 -- start both, wait for backend health check
- scripts/reset-demo.ps1 -- delete DB, re-seed, optionally import Tamarind (-Import flag)
- scripts/validate-demo.ps1 -- automated demo readiness validation

**Documentation added/updated**
- docs/RELEASE_CHECKLIST.md (new)
- docs/DEMO_RUNBOOK.md (rewritten for Sprint 8)
- DEVELOPMENT_LOG.md, docs/SPRINT_PLAN.md, docs/ARCHITECTURE.md, README.md

**Files added**
- src/app/components/ErrorBoundary.tsx
- scripts/start-backend.ps1, start-frontend.ps1, start-demo.ps1, reset-demo.ps1, validate-demo.ps1
- docs/RELEASE_CHECKLIST.md

**Files modified**
- src/app/App.tsx (ErrorBoundary wrapper)
- src/app/components/Dashboard.tsx (removed filter bar, refresh loading, renamed queue ageing)
- src/app/components/RegulationReview.tsx (missing source text handling, display fallbacks)
- src/styles/index.css (spin keyframes)
- backend/main.py (structured logging, startup info, error middleware)
- backend/routers/regulations.py (review action logging)
- docs/DEMO_RUNBOOK.md (rewritten)

**Validation performed**
- 67 backend tests passing
- Frontend build: succeeded, 301 KB JS, 87 KB CSS
- Demo journey: Dashboard -> Source Queue -> Review Table -> Regulation Review -> Search -> Export -> Dashboard verified
- Imported source without source text shows graceful placeholder
- Taiwan source shows source text with highlighting
- Review actions persist across backend restart
- Empty database handled gracefully

**Known limitations**
- Saved views in Intelligence Library are static (not persisted)
- Publish button is a placeholder (no publish workflow)
- Settings button is a placeholder
- User profile ("Jane Lee") is hardcoded
- No real-time updates (manual refresh only)

---

## Sprint Tracking Template

### Sprint X – Sprint Name

**Status:** Planned / In Progress / Completed

**Objective**
Describe the primary sprint objective.

**Changes implemented**
- Change

**Files added**
- File path

**Files modified**
- File path

**API or data changes**
- Change

**Validation performed**
- Test or command
- Result

**Known limitations**
- Limitation

**Decisions**
- Decision and rationale

**Next steps**
- Next action
