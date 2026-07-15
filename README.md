# Regulatory Intelligence Prototype

A proof-of-concept application for tracking, reviewing, and exporting tobacco and nicotine regulatory developments across multiple jurisdictions. Built for regulatory analysts who need evidence-backed intelligence with full traceability from source document to extracted data.

## Current Status

**Phase:** Sprint 0 -- Audit and documentation complete
**Frontend:** React + Vite SPA with static mock data
**Backend:** Not yet implemented (planned: FastAPI + SQLite)

The UI was exported from [Figma Make](https://www.figma.com/design/Wh2ZFOMvruYZIRTRQhpG2V/Regulatory-Intelligence-Prototype) and has been stabilised for Windows ARM64 builds. All screens use static/mock data and local component state. No backend, database, or AI extraction logic exists yet.

## Technology Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | React 18.3, Vite 6.3, Tailwind CSS 4.1             |
| UI library | shadcn/ui components (installed, not yet active)    |
| Icons      | Lucide React                                        |
| Styling    | Inline React styles + KIAA design tokens            |
| Backend    | FastAPI (planned)                                   |
| Database   | SQLite (planned)                                    |
| Language   | TypeScript (frontend), Python (backend, planned)    |

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 9+ (`npm install -g pnpm`)
- **Windows ARM64 note:** The project includes native ARM64 dependencies for Rollup and LightningCSS. These are already configured in `package.json` devDependencies.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
# Open http://localhost:5173

# Production build
pnpm run build
# Output: dist/
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
