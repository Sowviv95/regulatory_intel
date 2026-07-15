# Requirements -- Regulatory Intelligence PoC

**Status:** Draft
**Date:** 15 July 2026
**Sprint:** 0

---

## 1. Purpose

The Regulatory Intelligence PoC demonstrates a workflow for tracking, reviewing, and exporting tobacco and nicotine regulatory developments across multiple jurisdictions. It allows regulatory analysts to review AI-extracted regulatory data against source documents, approve or flag individual fields with full evidence traceability, and export validated intelligence records.

## 2. Target Users

- **Regulatory analysts** who monitor tobacco and nicotine regulations across jurisdictions
- **Compliance managers** who need evidence-backed regulatory intelligence for decision-making

**Assumption:** The initial PoC targets a single-user desktop workflow. Multi-user collaboration and authentication are out of scope.

## 3. Primary User Journey

```
Dashboard (overview of regulatory landscape)
  -> Source Queue (view incoming regulatory documents)
    -> Open a processed source
      -> Review extracted regulation fields
        -> Inspect evidence linking each field to source text
        -> Edit or approve individual fields
  -> Search approved records in Intelligence Library
    -> Export evidence-backed results (CSV/Excel)
```

## 4. Functional Scope

### 4.1 Dashboard

- Display KPI summary cards (total regulations, new this week, high impact, pending review)
- Show jurisdiction coverage with progress indicators
- Show recent regulatory alerts with impact and status badges
- Provide filter controls for country, status, product type, date range
- Navigate to Source Queue or regulation detail from alert items

**Assumption:** Dashboard KPIs will be computed from database records once the backend exists. Current values are static placeholders.

### 4.2 Source Queue

- Display regulatory source documents in a filterable, tabbed queue
- Status tabs: New, Processing, Ready for Review, Irrelevant
- Show processing stage for each document (Awaiting Extraction, Translating, AI Extraction, Quality Check, Analyst Review, Discarded)
- Processing summary cards (active jobs, ready for review, failures)
- Actions: Start Processing, Mark Irrelevant, Retry, Restore, Open Review
- Navigate to Review Table when opening a "Ready for Review" source

**Assumption:** Processing stages are informational in the PoC. Actual extraction pipeline is out of scope.

### 4.3 Regulation Review (Single Document)

- Three-panel layout: source document (left), extracted fields (centre), field evidence (right)
- Display original source text with line-level highlighting linked to selected field
- Extracted fields: title, summary, products impacted, jurisdiction, status, source type, proposer, sector impact, likelihood, effective date, notice date, comment deadline
- Evidence panel shows source text excerpt, line reference, and confidence score for selected field
- Edit mode: inline editing of field values
- Actions: Edit toggle, Approve, Publish
- Navigate between regulations (Prev/Next)

### 4.4 Regulation Review Table

- Source selector with search, prev/next navigation
- Field-level review table showing: category, field name, extracted value, source evidence, confidence score, status
- Field statuses: Pending, Accepted, Flagged
- Field categories: Metadata, Content, Assessment, Dates
- Filter by category and status
- KPI cards: total fields, accepted count, flagged count, review rate percentage
- Actions per field: Accept, Flag, Reset, Edit value
- Bulk action: Accept All
- Publish button

### 4.5 Search and Export (Intelligence Library)

- Full-text search across regulation titles, jurisdictions, keywords
- Filter chips: jurisdiction, product, regulatory status, source type, sector impact, date range
- Results table with checkbox selection
- Saved views sidebar with starred views
- Alert creation modal (name, filter conditions, frequency)
- Export: CSV and Excel (currently simulated with toast notification)
- Footer with record count and bulk export buttons

### 4.6 Evidence Inspection

- Each extracted field links to a specific excerpt from the source document
- Evidence includes: source text (often in original language), line reference, confidence percentage
- Clicking a field in the review screens highlights the corresponding source text
- Evidence panel displays field name, source excerpt, and confidence bar

**Assumption:** Evidence data will come from existing Tamarind extraction outputs. The confidence scores shown are illustrative.

## 5. Data Sources

- **Initial data:** Existing Tamarind extraction inputs (source documents) and outputs (extracted fields with evidence)
- **AI extraction:** Out of scope for the functional PoC. Extraction results will be imported, not generated.
- **Future:** The system will support ingestion of new Tamarind outputs as they become available

## 6. Non-Functional Requirements

| Requirement                   | Detail                                                       |
|-------------------------------|--------------------------------------------------------------|
| Local-first development       | Must run fully on a local machine without cloud services      |
| Clear traceability            | Every extracted field must link to source evidence            |
| Repeatable demo setup         | Single command to install and start; consistent demo data     |
| Minimal dependency upgrades   | Do not upgrade React, Vite, Tailwind, or other major deps    |
| Preserve KIAA light theme     | Green accent (#16a34a), light backgrounds, Inter font family |
| Windows ARM64 compatibility   | Build and dev server must work on Windows ARM64              |
| No authentication required    | Single-user desktop PoC                                      |
| Browser-based UI              | Standard modern browser (Chrome/Edge recommended)            |

## 7. Out of Scope

- AI extraction or summarisation logic
- Backend API implementation (documented only in Sprint 0)
- Database creation or migration (documented only in Sprint 0)
- Multi-user support or authentication
- Role-based access control
- Real-time notifications or WebSocket updates
- Deployment to cloud or staging environments
- Mobile-responsive layout
- Dark mode (CSS variables exist but not actively supported)
- Internationalisation (i18n)
- Performance optimisation for large datasets (>1000 records)
- Integration with external regulatory data feeds
- Automated testing framework (deferred to later sprint)
