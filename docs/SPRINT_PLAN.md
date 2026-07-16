# Sprint Plan -- Regulatory Intelligence PoC

**Status:** Draft
**Date:** 15 July 2026

---

## Sprint 0 -- Audit and Documentation

**Status:** Completed

**Objective:** Audit the existing codebase, document the PoC requirements and architecture, and establish a clean development baseline.

**Scope:**
- Read and understand all existing components, data, and configuration
- Create CODEBASE_AUDIT.md, REQUIREMENTS.md, ARCHITECTURE.md, DATA_MODEL.md, API_CONTRACT.md
- Create SPRINT_PLAN.md and DEMO_RUNBOOK.md
- Update README.md and DEVELOPMENT_LOG.md
- Verify the production build still works

**Acceptance criteria:**
- All documentation files exist in `docs/`
- README.md reflects current project state
- `pnpm run build` succeeds without errors
- No visible UI behaviour has changed
- DEVELOPMENT_LOG.md has a Sprint 0 entry

**Dependencies:** None

**Out of scope:** Code changes, routing, backend, database, dependency upgrades

---

## Sprint 1 -- Routing and Shared Frontend Data Layer

**Status:** Completed

**Objective:** Replace state-based screen switching with React Router and extract static data into a shared data layer.

**Scope:**
- Add React Router with URL paths for each screen
- Create route definitions (`/`, `/sources`, `/review/:id`, `/review-table/:sourceId`, `/search`)
- Extract all inline mock data from components into `src/data/mock.ts`
- Define shared TypeScript interfaces in `src/types/index.ts`
- Create a service layer (`src/services/`) that returns mock data (to be swapped for API calls later)
- Update TopNav to use router links
- Ensure browser back/forward navigation works

**Acceptance criteria:**
- Each screen is accessible via a distinct URL
- Browser back/forward works correctly
- All screens render identically to current state
- Mock data is centralised in one location
- TypeScript interfaces match the data model
- `pnpm run build` succeeds

**Dependencies:** Sprint 0 complete

**Out of scope:** Backend API, database, new UI features, dependency upgrades

---

## Sprint 2 -- Source Queue Functionality

**Status:** Completed

**Objective:** Make the Source Queue screen functional with the shared data layer.

**Scope:**
- Connect Source Queue to the centralised mock data via service layer
- Implement status transitions (New -> Processing -> Ready for Review, or -> Irrelevant)
- Maintain queue state across navigation (source queue state persists when navigating away and back)
- "Open Review" action navigates to Review Table with correct source ID via router
- Processing summary cards reflect actual queue state

**Acceptance criteria:**
- Status tab counts update when actions are taken
- State persists across screen navigation
- "Open Review" navigates to `/review-table/:sourceId`
- Processing summary cards show correct numbers
- Visual appearance matches current UI

**Dependencies:** Sprint 1 complete

**Out of scope:** Backend API, real extraction pipeline, new queue features

---

## Sprint 3 -- Regulatory Review Workflow

**Status:** Completed

**Objective:** Connect both review screens (RegulationReview and RegulationReviewTable) to the shared data layer with full review functionality.

**Scope:**
- Connect RegulationReview to shared data via service layer
- Connect RegulationReviewTable to shared data via service layer
- Unify the regulation and field data between the two review screens
- Field-level Accept, Flag, Reset, Edit actions update shared state
- Approve action on RegulationReview updates regulation status
- Evidence highlighting works with shared evidence data
- Prev/Next navigation cycles through available sources
- Review state persists across navigation

**Acceptance criteria:**
- Editing a field in RegulationReviewTable reflects in shared data
- Accepting a field shows correct status in both review screens
- Evidence panel displays correct source excerpts
- Approve action changes regulation status to "Approved"
- Visual appearance matches current UI

**Dependencies:** Sprint 2 complete

**Out of scope:** Backend API, comments, publish action, new review features

---

## Sprint 4 -- Search, Evidence, and Export

**Status:** Completed

**Objective:** Connect the Intelligence Library to shared data and implement local export functionality.

**Scope:**
- Connect SearchExport to shared data via service layer
- Implement client-side full-text search across regulation records
- Implement all filter chips with actual filtering logic
- Implement CSV export (generate and download a CSV file in the browser)
- Implement Excel export (generate and download XLSX using a lightweight library)
- Saved views: persist view definitions in local state
- Selection and bulk export

**Acceptance criteria:**
- Search returns matching regulations from shared data
- All filter chips work correctly and combine logically
- CSV export downloads a valid CSV file
- Excel export downloads a valid XLSX file
- Export includes evidence data when applicable
- Saved views can be created and selected
- Visual appearance matches current UI

**Dependencies:** Sprint 3 complete

**Out of scope:** Backend API, alert notifications, server-side export

---

## Sprint 5 -- FastAPI and SQLite Persistence

**Status:** Completed

**Objective:** Introduce a FastAPI backend with SQLite database and connect the frontend to real API endpoints.

**Scope:**
- Create FastAPI project structure in `backend/`
- Implement SQLite database schema matching the data model
- Implement API endpoints per API_CONTRACT.md
- Create database seed script with demo data matching current mock data
- Update frontend service layer to call real API endpoints
- Add CORS configuration for local development
- Add health check endpoint

**Acceptance criteria:**
- `python main.py` starts the FastAPI server
- All documented API endpoints return correct responses
- Frontend fetches data from backend instead of mock data
- Database seed script creates consistent demo data
- All screens work correctly with API data
- `pnpm run build` succeeds

**Dependencies:** Sprint 4 complete

**Out of scope:** AI extraction, Tamarind ingestion, authentication, deployment

---

## Sprint 6 -- Tamarind Output Ingestion

**Status:** Completed

**Objective:** Import existing Tamarind extraction outputs into the database.

**Scope:**
- Analyse Tamarind output format (Excel structured outputs)
- Create import service that reads Tamarind outputs and creates database records
- Map Tamarind fields to the data model (Source, Regulation, RegulatoryField, Evidence)
- Create import CLI command
- Handle edge cases: mixed field formats, missing confidence scores, null sub-products
- Idempotent import with dry-run mode

**Acceptance criteria:**
- Tamarind outputs are successfully imported into SQLite (54 records, 5 jurisdictions)
- Imported records appear correctly in all screens
- Evidence traceability is maintained (field -> evidence -> source text)
- Import is idempotent (re-running does not create duplicates)
- Reviewer edits survive re-import
- Demo seed data remains distinguishable from imported data
- Documentation updated with import instructions
- 53 backend tests passing

**Dependencies:** Sprint 5 complete, Tamarind output files available

**Out of scope:** AI extraction pipeline, real-time ingestion, new source discovery

---

## Sprint 7 -- Dashboard Integration

**Status:** Completed

**Objective:** Make the Dashboard screen display real computed metrics from the database.

**Scope:**
- Rewrite GET /api/dashboard with comprehensive live metrics
- KPI cards show computed values with navigation links
- Stats bar with field-level review counts and evidence coverage
- Jurisdiction coverage computed from actual source/regulation data
- Recent sources populated from actual database records
- Recent review activity from review_decisions table
- Queue ageing showing oldest pending sources
- Card navigation to filtered Source Queue and Search screens
- URL query parameter support for dashboard-driven filters
- Empty database handling

**Acceptance criteria:**
- All dashboard values derived from live database state
- Jurisdiction coverage percentages are correct
- KPI and stats cards navigate to correctly filtered views
- 67 backend tests passing (32 API + 14 dashboard + 21 import)
- Frontend build succeeds
- Empty database returns zeros, not errors

**Dependencies:** Sprint 6 complete

**Out of scope:** Real-time updates, charts/graphs beyond current KPIs, alert notifications

---

## Sprint 8 -- Demo Hardening

**Status:** Completed

**Objective:** Polish the end-to-end demo experience and ensure reliability.

**Scope:**
- Remove decorative non-functional controls
- Handle missing source text gracefully for imported records
- Add React error boundary
- Add structured backend logging
- Create PowerShell startup/reset/validation scripts
- Create RELEASE_CHECKLIST.md
- Rewrite DEMO_RUNBOOK.md
- Validate complete demo journey
- Add refresh loading feedback
- Test on Windows ARM64

**Acceptance criteria:**
- Complete demo journey works without errors
- Demo can be set up from scratch in under 5 minutes (reset-demo.ps1 -Import)
- validate-demo.ps1 passes all checks
- DEMO_RUNBOOK.md is complete and accurate
- All documentation is current
- 67 backend tests passing
- Frontend build succeeds on Windows ARM64

**Dependencies:** Sprint 7 complete

**Out of scope:** New features, deployment, authentication, performance optimisation
