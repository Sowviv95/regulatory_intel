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
