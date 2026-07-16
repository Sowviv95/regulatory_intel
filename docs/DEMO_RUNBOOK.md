# Demo Runbook -- Regulatory Intelligence PoC

**Status:** Final (Sprint 8)
**Date:** 16 July 2026

---

## 1. Demo Journey

```
1. Dashboard
   - Show KPI summary: Total Sources, Ready for Review, High Impact, Review Progress
   - Show stats bar: Regulations, Accepted, Rejected, Flagged, Low Confidence, Evidence
   - Highlight jurisdiction coverage across 8 jurisdictions
   - Click "Ready for Review" KPI to navigate to Source Queue

2. Source Queue
   - Show all 66 sources across status tabs
   - Filter by "Ready for Review" status (pre-filtered from dashboard)
   - Point out imported Tamarind sources alongside demo sources
   - Click a Tamarind-imported source to open Review Table

3. Review Table
   - Show 12 extracted fields with categories, values, evidence, confidence
   - Accept a field, flag a field, edit a field value
   - Show the source selector to switch between sources
   - Click "Detail View" to switch to 3-panel layout

4. Regulation Review (3-panel)
   - Sources with original text: show source document with line highlighting
   - Imported sources: show "Original document text unavailable" with evidence in right panel
   - Click fields to show evidence excerpts and confidence
   - Accept All Pending to complete review

5. Intelligence Library (Search & Export)
   - Search for reviewed records
   - Filter by status (Accepted), confidence level, jurisdiction
   - Select rows and export as CSV
   - Show evidence drawer for a record

6. Return to Dashboard
   - Refresh to see updated review progress
   - Show accepted/flagged counts have changed
   - Demonstrate the complete review lifecycle
```

## 2. Startup

### Quick start (PowerShell)

```powershell
# Full reset with Tamarind import
.\scripts\reset-demo.ps1 -Import

# Start both servers
.\scripts\start-demo.ps1

# Open http://localhost:5173
```

### Manual start

```bash
# Terminal 1 -- Backend
cd backend
pip install -r requirements.txt
python main.py
# API: http://localhost:8000

# Terminal 2 -- Frontend
pnpm install
pnpm run dev
# UI: http://localhost:5173
```

## 3. Expected Demo Data

| Data Type           | Count | Notes                                           |
|---------------------|-------|-------------------------------------------------|
| Total sources       | 66    | 12 seed + 54 Tamarind imported                  |
| Jurisdictions       | 8     | Taiwan, Denmark, Finland, Poland, South Korea, Vietnam, UAE, plus seed countries |
| Regulations         | 60    | 6 seed + 54 imported                            |
| Fields per source   | 12-13 | 13 for seed, 12 for imported                    |
| Total fields        | 726   | All with evidence records                       |
| Evidence coverage   | 100%  | Every field has linked evidence                 |

**Key demo source:** Taiwan -- Tobacco Hazards Prevention Act Amendment 2026
- Full Chinese source text with evidence highlighting
- 13 extracted fields with high confidence scores

## 4. Screens

| Screen              | URL                      | Key Demo Points                          |
|---------------------|--------------------------|------------------------------------------|
| Dashboard           | `/`                      | Live KPIs, jurisdictions, activity       |
| Source Queue         | `/sources`               | Status tabs, search, bulk actions        |
| Review Table         | `/sources/:sourceId`     | Field-level review, accept/flag/edit     |
| Regulation Review    | `/regulations/:id`       | 3-panel layout, evidence, source text    |
| Intelligence Library | `/search`                | Search, filters, CSV export              |

## 5. Pre-Demo Validation

```powershell
.\scripts\validate-demo.ps1
```

Or manually:

- [ ] `http://localhost:8000/api/health` returns `{"status": "ok"}`
- [ ] Dashboard loads with live KPIs (not zeros)
- [ ] Source Queue shows 66 sources
- [ ] Review Table loads fields for an imported source
- [ ] Search shows all field records
- [ ] CSV export downloads successfully
- [ ] No console errors in browser DevTools

## 6. Demo Tips

- **Start on Dashboard** for context before diving into workflow
- **Use Taiwan regulation** for evidence highlighting (has full Chinese source text)
- **Use a Tamarind import** (e.g., Poland or UAE) to show imported data without source text
- **Highlight evidence traceability** -- click fields to show evidence excerpts and confidence
- **Show review persistence** -- accept a field, refresh, confirm it persists
- **Use the stats bar** to show field-level review progress at a glance
- **End with CSV export** to show the complete intelligence lifecycle

## 7. Troubleshooting

| Issue                      | Resolution                                    |
|----------------------------|-----------------------------------------------|
| Port 5173 in use           | Kill the process or use `pnpm run dev -- --port 5174` |
| Port 8000 in use           | Kill the process or change port in main.py    |
| Database missing           | Run `.\scripts\reset-demo.ps1 -Import`        |
| Backend won't start        | Check Python 3.10+; `pip install -r requirements.txt` |
| Empty dashboard            | Database may not be seeded; run reset script   |
| Build fails on ARM64       | Ensure ARM64 rollup/lightningcss devDeps present |
