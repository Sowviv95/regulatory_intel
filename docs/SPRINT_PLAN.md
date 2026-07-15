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

**Objective:** Import existing Tamarind extraction outputs into the database.

**Scope:**
- Analyse Tamarind output format (JSON/CSV structure)
- Create import service that reads Tamarind outputs and creates database records
- Map Tamarind fields to the data model (Source, Regulation, RegulatoryField, Evidence)
- Create import CLI command or API endpoint
- Validate imported data against existing mock data
- Handle edge cases: missing fields, confidence scores, multilingual text

**Acceptance criteria:**
- Tamarind outputs are successfully imported into SQLite
- Imported records appear correctly in all screens
- Evidence traceability is maintained (field -> evidence -> source text)
- Import is idempotent (re-running does not create duplicates)
- Documentation updated with import instructions

**Dependencies:** Sprint 5 complete, Tamarind output files available

**Out of scope:** AI extraction pipeline, real-time ingestion, new source discovery

---

## Sprint 7 -- Dashboard Integration

**Objective:** Make the Dashboard screen display real computed metrics from the database.

**Scope:**
- Implement `/api/dashboard` endpoint with real aggregations
- KPI cards show computed values (total regulations, new this week, high impact, pending review)
- Jurisdiction coverage computed from actual source/regulation data
- Recent alerts populated from actual recent regulations
- Dashboard filters apply to real data
- Refresh button triggers data reload

**Acceptance criteria:**
- Dashboard KPIs reflect actual database state
- Jurisdiction coverage percentages are correct
- Recent alerts show the most recent high-priority regulations
- Filters work correctly
- Dashboard loads within 2 seconds

**Dependencies:** Sprint 6 complete

**Out of scope:** Real-time updates, charts/graphs beyond current KPIs, alert notifications

---

## Sprint 8 -- Demo Hardening

**Objective:** Polish the end-to-end demo experience and ensure reliability.

**Scope:**
- Validate the complete demo journey (Dashboard -> Source Queue -> Review -> Search -> Export)
- Fix any visual inconsistencies or broken interactions
- Ensure consistent demo data across all screens
- Create/update DEMO_RUNBOOK.md with final instructions
- Add pre-demo validation script
- Test on Windows ARM64
- Document known limitations and workarounds
- Clean up any remaining unused code (if safe)

**Acceptance criteria:**
- Complete demo journey works without errors
- Demo can be set up from scratch in under 5 minutes
- Pre-demo validation script passes
- DEMO_RUNBOOK.md is complete and accurate
- All documentation is current
- Build succeeds on Windows ARM64

**Dependencies:** Sprint 7 complete

**Out of scope:** New features, deployment, authentication, performance optimisation
