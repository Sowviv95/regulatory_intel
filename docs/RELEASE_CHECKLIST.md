# Release Checklist -- Regulatory Intelligence PoC

Use this checklist before each demo or handoff.

## Environment

- [ ] Python 3.10+ installed and on PATH
- [ ] Node.js 18+ installed
- [ ] pnpm 9+ installed (`npm install -g pnpm`)
- [ ] `pip install -r backend/requirements.txt` completed
- [ ] `pnpm install` completed

## Database

- [ ] Database exists at `backend/data/regulatory_intel.db`
- [ ] Seed data present (12 sources, 6 regulations, 78 fields)
- [ ] Tamarind data imported (54 sources from Batch 1)
- [ ] To reset: `.\scripts\reset-demo.ps1 -Import`

## Backend

- [ ] `python -m pytest backend/tests/ -v` -- all tests pass
- [ ] `python backend/main.py` starts without errors
- [ ] `http://localhost:8000/api/health` returns `{"status": "ok"}`
- [ ] Startup log shows source/regulation/field counts

## Frontend

- [ ] `pnpm run build` succeeds without errors
- [ ] `pnpm run dev` starts on http://localhost:5173
- [ ] No console errors in browser DevTools

## Demo Journey

- [ ] **Dashboard** loads with live KPI cards
- [ ] KPI cards show correct totals (66 sources, review progress)
- [ ] Stats bar shows regulation/field/evidence counts
- [ ] Jurisdiction coverage shows 8 jurisdictions with progress bars
- [ ] Click KPI card navigates to filtered view
- [ ] **Source Queue** shows all sources, tabs filter by status
- [ ] Click a Tamarind-imported source opens Review Table
- [ ] **Review Table** shows 12 extracted fields with evidence
- [ ] Accept, Reject, Flag, Edit, Comment actions work
- [ ] **Regulation Review** (3-panel) shows structured evidence
- [ ] Sources without original text show "document text unavailable" message
- [ ] Taiwan source shows Chinese source text with highlighting
- [ ] **Search** shows all field records, filters work
- [ ] CSV export downloads a valid file
- [ ] Return to **Dashboard** -- counts reflect review actions
- [ ] **Restart backend** -- review decisions persist

## Validation Script

```powershell
.\scripts\validate-demo.ps1
```

All checks should pass.
