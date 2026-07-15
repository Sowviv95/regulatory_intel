# Demo Runbook -- Regulatory Intelligence PoC

**Status:** Provisional -- this runbook will be updated as the PoC matures
**Date:** 15 July 2026
**Sprint:** 0

---

## 1. Intended Demo Journey

```
1. Dashboard
   - Show KPI summary cards
   - Highlight jurisdiction coverage
   - Point out recent alerts with impact badges
   - Click "View all" to go to Source Queue

2. Source Queue
   - Show incoming regulatory documents across jurisdictions
   - Switch between status tabs (New, Processing, Ready for Review)
   - Click "Open Review" on a Ready for Review item

3. Review Table (RegulationReviewTable)
   - Show field-level review table for the selected source
   - Point out categories, extracted values, source evidence, confidence scores
   - Accept a field, flag a field, edit a field value
   - Switch to a different source using the source selector

4. Regulation Review (single document view)
   - Show 3-panel layout: source document, extracted fields, evidence
   - Click a field to highlight the corresponding source text
   - Show evidence panel with source excerpt and confidence
   - Toggle edit mode, modify a field value
   - Click Approve

5. Intelligence Library (Search & Export)
   - Search for a regulation by keyword
   - Apply filter chips (jurisdiction, product, impact)
   - Select rows with checkboxes
   - Export as CSV or Excel

6. Return to Dashboard
   - Show that the workflow is circular and self-contained
```

## 2. Required Startup Steps

### Current state (Sprint 0 -- frontend only)

```bash
cd "D:\Regulatory Intelligence"
pnpm install
pnpm run dev
# Open http://localhost:5173 in Chrome or Edge
```

### Future state (with backend)

```bash
# Terminal 1 -- Backend
cd "D:\Regulatory Intelligence\backend"
pip install -r requirements.txt
python -m seed.sample_data      # Seed demo data
python main.py                  # Start API on http://localhost:8000

# Terminal 2 -- Frontend
cd "D:\Regulatory Intelligence"
pnpm install
pnpm run dev                    # Start UI on http://localhost:5173
```

## 3. Expected Demo Data

| Data Type           | Count | Source              |
|---------------------|-------|---------------------|
| Jurisdictions       | 6     | Taiwan, Denmark, Finland, Poland, South Korea, Vietnam |
| Source documents     | 12    | Queue items with various statuses |
| Detailed sources    | 6     | With full fields and evidence |
| Regulatory fields   | 13    | Per source (Metadata, Content, Assessment, Dates) |
| Search results      | 12    | Approved/Published regulations |
| Saved views         | 5     | Pre-configured search views |

**Key demo regulation:** Taiwan -- Tobacco Hazards Prevention Act Amendment 2026
- Full Chinese source text with line-level evidence linking
- 13 extracted fields with confidence scores
- Evidence highlighting in the source document panel

## 4. Screens Covered

| Screen                | URL (future)           | Key Demo Points                          |
|-----------------------|------------------------|------------------------------------------|
| Dashboard             | `/`                    | KPIs, jurisdiction coverage, alerts      |
| Source Queue           | `/sources`             | Status tabs, processing stages, actions  |
| Regulation Review      | `/review/:id`          | 3-panel layout, evidence highlighting    |
| Review Table           | `/review-table/:id`    | Field-level review, accept/flag/edit     |
| Intelligence Library   | `/search`              | Search, filters, export                  |

## 5. Known Placeholders

| Feature                | Current State                          | Target State                          |
|------------------------|----------------------------------------|---------------------------------------|
| Dashboard KPIs         | Static hardcoded values                | Computed from database                |
| Source Queue processing| Status changes are local state only    | Persisted to database                 |
| Regulation approval    | Local state, resets on navigation      | Persisted to database                 |
| Evidence confidence    | Static percentages                     | From Tamarind extraction output       |
| Search                 | Client-side filter on static array     | Server-side full-text search          |
| Export                 | Toast notification only                | Actual file download                  |
| Saved views            | Static list, not persisted             | Saved to database                     |
| Alerts                 | Modal only, not functional             | Alert system (future)                 |
| Publish button         | No action                              | Status transition + notification      |
| Refresh buttons        | No action                              | Reload data from API                  |
| Prev/Next (review)     | Cycles through static sources          | Cycles through database records       |
| Settings button        | No action                              | Settings panel (future/out of scope)  |
| User profile (JL)      | Static display                         | Authentication (out of scope)         |

## 6. Pre-Demo Validation Checklist

- [ ] `pnpm install` completed without errors
- [ ] `pnpm run dev` starts successfully
- [ ] Dashboard loads and shows all KPI cards
- [ ] Source Queue shows 12 items across tabs
- [ ] "Ready for Review" tab shows 4 items
- [ ] Clicking "Open Review" navigates to Review Table
- [ ] Review Table shows 13 fields for Taiwan source
- [ ] Accept, Flag, Edit actions work on fields
- [ ] Source selector dropdown opens and shows 6 sources
- [ ] Intelligence Library shows 12 search results
- [ ] Filter chips filter the results correctly
- [ ] Export buttons show confirmation toast
- [ ] No console errors in browser DevTools
- [ ] Backend running (when applicable): `curl http://localhost:8000/api/health`

## 7. Demo Tips

- **Start on Dashboard** for context before diving into workflow
- **Use Taiwan regulation** as primary example -- it has the richest data including Chinese source text
- **Highlight evidence traceability** -- click fields to show source highlighting, then show evidence panel
- **Show the confidence scores** -- demonstrate that lower-confidence fields can be flagged for review
- **Use the Review Table** for bulk actions (Accept All) to show efficiency
- **End with export** to show the complete intelligence lifecycle

## 8. Troubleshooting

| Issue                      | Resolution                                    |
|----------------------------|-----------------------------------------------|
| `pnpm install` fails       | Delete `node_modules` and `pnpm-lock.yaml`, retry |
| Port 5173 in use           | Kill the process or use `--port 5174`         |
| Build fails on ARM64       | Ensure `@rollup/rollup-win32-arm64-msvc` and `lightningcss-win32-arm64-msvc` are in devDependencies |
| Blank page on load         | Check browser console for errors; verify `src/main.tsx` exists |
| Backend won't start        | Check Python version (3.10+); verify `requirements.txt` installed |
