# Regulatory Intelligence Prototype

A proof-of-concept application for tracking, reviewing, and exporting tobacco and nicotine regulatory developments across multiple jurisdictions. Built for regulatory analysts who need evidence-backed intelligence with full traceability from source document to extracted data.

## Current Status

**Phase:** Sprint 5 -- FastAPI + SQLite persistence complete
**Frontend:** React + Vite SPA connected to backend API
**Backend:** FastAPI + SQLite (local-first, no cloud dependencies)

The UI was exported from [Figma Make](https://www.figma.com/design/Wh2ZFOMvruYZIRTRQhpG2V/Regulatory-Intelligence-Prototype) and has been stabilised for Windows ARM64 builds. All review actions, status changes, and comments now persist to SQLite.

## Technology Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | React 18.3, Vite 6.3, Tailwind CSS 4.1             |
| UI library | shadcn/ui components (installed, not yet active)    |
| Icons      | Lucide React                                        |
| Styling    | Inline React styles + KIAA design tokens            |
| Backend    | FastAPI 0.115+, Python 3.10+                       |
| Database   | SQLite (local file, WAL mode)                       |
| Language   | TypeScript (frontend), Python (backend)              |

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 9+ (`npm install -g pnpm`)
- **Python** 3.10+ with pip
- **Windows ARM64 note:** The project includes native ARM64 dependencies for Rollup and LightningCSS. These are already configured in `package.json` devDependencies.

## Getting Started

```bash
# Terminal 1 -- Backend
cd backend
pip install -r requirements.txt
python main.py
# API running on http://localhost:8000

# Terminal 2 -- Frontend
pnpm install
pnpm run dev
# Open http://localhost:5173

# Production build (frontend only)
pnpm run build
# Output: dist/

# Run backend tests
cd backend
python -m pytest tests/ -v
```

## Current Limitations

- All data is static/mock -- no persistence across page reloads
- No URL-based routing (screen switching is state-driven)
- No backend API
- Export buttons show a confirmation toast but do not generate files
- Settings, Publish, and Refresh buttons are non-functional placeholders
- Single hardcoded user profile ("Jane Lee")
- Dashboard KPIs are static values

## Documentation

| Document                                          | Description                                   |
|---------------------------------------------------|-----------------------------------------------|
| [Codebase Audit](docs/CODEBASE_AUDIT.md)         | Project structure, components, known issues    |
| [Requirements](docs/REQUIREMENTS.md)              | PoC scope, user journey, functional scope      |
| [Architecture](docs/ARCHITECTURE.md)              | Current and target architecture                |
| [Data Model](docs/DATA_MODEL.md)                  | Conceptual entities and relationships          |
| [API Contract](docs/API_CONTRACT.md)              | Proposed REST API endpoints (draft)            |
| [Sprint Plan](docs/SPRINT_PLAN.md)                | Sprint 0-8 plan with acceptance criteria       |
| [Demo Runbook](docs/DEMO_RUNBOOK.md)              | Demo journey and setup instructions            |
| [Development Log](DEVELOPMENT_LOG.md)             | Change log and sprint tracking                 |

## Repository Structure

```
D:\Regulatory Intelligence\
  index.html                    # Vite HTML entry
  package.json                  # Dependencies and scripts
  vite.config.ts                # Vite + Tailwind + Figma asset resolver
  docs/                         # Project documentation
  src/
    main.tsx                    # React root mount
    app/
      App.tsx                   # Root component with screen state
      components/
        Dashboard.tsx           # Dashboard screen
        SourceQueue.tsx         # Source queue screen
        RegulationReview.tsx    # Single-regulation review (3-panel)
        RegulationReviewTable.tsx # Multi-source review table
        SearchExport.tsx        # Intelligence library / search & export
        TopNav.tsx              # Horizontal navigation bar
        Sidebar.tsx             # Sidebar navigation (unused)
        KBadge.tsx              # Reusable badge component
        kiaa-tokens.ts          # Design tokens and style helpers
        figma/                  # Figma-generated utility components
        ui/                     # shadcn/ui component library (47 components)
    styles/
      index.css                 # CSS entry point
      tailwind.css              # Tailwind v4 configuration
      theme.css                 # CSS custom properties and base styles
```

## Repository

https://github.com/Sowviv95/regulatory_intel
