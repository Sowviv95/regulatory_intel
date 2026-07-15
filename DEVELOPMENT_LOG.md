# Regulatory Intelligence – Development Log

This document tracks the functional changes, architectural decisions, sprint outputs, validation results, and known issues for the Regulatory Intelligence prototype.

## Project Information

- Repository: https://github.com/Sowviv95/regulatory_intel
- Local folder: D:\Regulatory Intelligence
- Frontend source: Figma Make export
- Package manager: pnpm
- Current phase: Figma UI baseline

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
