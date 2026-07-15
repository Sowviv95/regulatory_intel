# Codebase Audit

**Date:** 15 July 2026
**Sprint:** 0 -- Audit and documentation
**Auditor:** Claude Code

---

## 1. Project Structure

```
D:\Regulatory Intelligence\
  index.html                          # Vite HTML entry point
  package.json                        # Dependencies and scripts (name: @figma/my-make-file)
  pnpm-workspace.yaml                 # pnpm workspace config with ARM64 build support
  vite.config.ts                      # Vite config with Figma asset resolver, React, Tailwind
  postcss.config.mjs                  # PostCSS config (present but minimal)
  default_shadcn_theme.css            # Reference shadcn theme (not imported)
  ATTRIBUTIONS.md                     # Figma Make attributions
  guidelines/Guidelines.md            # Figma Make generated guidelines
  src/
    main.tsx                          # React root mount
    styles/
      index.css                       # CSS entry (imports fonts, tailwind, theme)
      fonts.css                       # Empty
      tailwind.css                    # Tailwind v4 config with tw-animate-css
      theme.css                       # CSS custom properties (light/dark), base styles
      globals.css                     # Empty
    imports/
      image.png                       # Imported image asset
      ChatGPT_Image_Jul_15__2026_*.png # Imported image asset
    app/
      App.tsx                         # Root component with screen state management
      components/
        Dashboard.tsx                 # Dashboard screen
        SourceQueue.tsx               # Source queue screen
        RegulationReview.tsx          # Single regulation review (3-panel layout)
        RegulationReviewTable.tsx     # Multi-source review table
        SearchExport.tsx              # Intelligence library / search & export
        TopNav.tsx                    # Horizontal top navigation bar (active)
        Sidebar.tsx                   # Vertical sidebar navigation (unused, superseded by TopNav)
        KBadge.tsx                    # Reusable badge component
        kiaa-tokens.ts               # Design tokens, Screen type, style helpers
        figma/
          ImageWithFallback.tsx       # Figma-generated image fallback component (unused)
        ui/                           # 47 shadcn/ui components (all unused)
          accordion.tsx ... tooltip.tsx
          utils.ts                    # cn() utility (used only within ui/)
          use-mobile.ts               # Mobile detection hook (unused)
```

## 2. Application Entry Points

- **HTML:** `index.html` loads `/src/main.tsx`
- **React root:** `src/main.tsx` renders `<App />` into `#root`
- **CSS:** `src/styles/index.css` imports fonts, tailwind, theme

## 3. Existing Screens

| Screen ID           | Component                    | Description                                       |
|---------------------|------------------------------|---------------------------------------------------|
| `dashboard`         | `Dashboard.tsx`              | KPIs, jurisdiction coverage, recent alerts         |
| `source-queue`      | `SourceQueue.tsx`            | Document intake queue with status tabs             |
| `regulation-review` | `RegulationReview.tsx`       | Single-regulation 3-panel review (source, fields, evidence) |
| `review-table`      | `RegulationReviewTable.tsx`  | Multi-source field-level review table              |
| `search-export`     | `SearchExport.tsx`           | Intelligence library with search, filter, export   |

## 4. Navigation Mechanism

- **Current:** `TopNav.tsx` provides horizontal navigation bar with 4 nav items (Dashboard, Source Queue, Review, Intelligence Library)
- **State-driven:** `App.tsx` uses `useState<Screen>` to switch between screens (no router)
- **Navigation callbacks:** `onNavigate(screen, item?)` prop drilling from App through components
- **Superseded:** `Sidebar.tsx` exists but is NOT imported or used by App.tsx

## 5. Data Flow and State Management

- **No global state:** Each screen manages its own `useState` hooks
- **No shared data layer:** Components import and define their own static data inline
- **Navigation state:** `screen` and `sourceId` managed in `App.tsx`
- **Source-to-review flow:** SourceQueue passes `sourceId` via `onNavigate('review-table', id)`, received as `initialSourceId` prop

## 6. Mock/Static Data Locations

| Component                  | Data                          | Lines    | Records |
|----------------------------|-------------------------------|----------|---------|
| `Dashboard.tsx`            | `kpis` array                  | 7-11     | 4       |
| `Dashboard.tsx`            | `jurisdictions` array         | 13-20    | 6       |
| `Dashboard.tsx`            | `alerts` array                | 22-29    | 6       |
| `SourceQueue.tsx`          | `initialRows` array           | 27-40    | 12      |
| `RegulationReview.tsx`     | `regulation` object           | 6-22     | 1       |
| `RegulationReview.tsx`     | `sourceText` (Chinese text)   | 24-63    | ~40 lines |
| `RegulationReview.tsx`     | `evidenceMap` object          | 65-90    | 6 fields |
| `RegulationReviewTable.tsx`| `sources` array               | 28-161   | 6 sources, 13 fields each |
| `SearchExport.tsx`         | `allResults` array            | 6-19     | 12      |
| `SearchExport.tsx`         | `savedViews` array            | 21-27    | 5       |

**Total static data:** ~200 lines of inline mock data across 4 components.

## 7. Reusable Components

| Component         | File               | Used By                              |
|-------------------|--------------------|--------------------------------------|
| `Badge`           | `KBadge.tsx`       | Dashboard, SourceQueue, RegulationReview, SearchExport |
| `K` tokens        | `kiaa-tokens.ts`   | All screen components                |
| `impactStyle()`   | `kiaa-tokens.ts`   | Dashboard, SearchExport              |
| `statusStyle()`   | `kiaa-tokens.ts`   | Dashboard, SourceQueue, RegulationReview |
| `Screen` type     | `kiaa-tokens.ts`   | App, TopNav, Sidebar, Dashboard, SourceQueue |

## 8. Figma-Generated Components

| Component            | Status  | Notes                                       |
|----------------------|---------|---------------------------------------------|
| `ImageWithFallback`  | Unused  | Figma fallback image component, not imported |
| `ui/*.tsx` (47 files)| Unused  | Full shadcn/ui library, none imported        |
| `utils.ts`           | Unused  | cn() utility, only referenced within ui/     |
| `use-mobile.ts`      | Unused  | Mobile hook, only referenced within ui/      |

## 9. Known Technical Issues

1. **No routing:** Screen switching is state-based; browser back/forward doesn't work; URLs don't change
2. **Sidebar.tsx unused:** `Sidebar.tsx` component exists but is not imported by App.tsx (superseded by TopNav.tsx)
3. **47 unused UI components:** Full shadcn/ui library in `ui/` directory -- none are imported by application code
4. **ImageWithFallback unused:** Figma-generated component not referenced anywhere
5. **Hardcoded data:** All data is inline static arrays/objects in component files
6. **No data sharing:** RegulationReview and RegulationReviewTable have overlapping but separate data for the same regulations
7. **Inline styles:** All styling is inline React `style` props rather than CSS classes or Tailwind utilities
8. **Figma package name:** `package.json` still has name `@figma/my-make-file`
9. **pnpm warning:** `pnpm.overrides` in package.json is deprecated; should be in pnpm-workspace.yaml
10. **react as peerDependency:** React 18.3.1 is listed as optional peerDependency, not a direct dependency
11. **Empty CSS files:** `fonts.css` and `globals.css` are empty
12. **Two images in src/imports/:** Purpose unclear; not referenced by any component

## 10. Dependency and Build Observations

- **Build:** `pnpm run build` succeeds in ~1.5s, no errors
- **Output:** dist/index.html (0.8 KB), CSS (85 KB), JS (258 KB)
- **Windows ARM64:** Explicit dev dependencies for `@rollup/rollup-win32-arm64-msvc` and `lightningcss-win32-arm64-msvc`
- **pnpm-workspace.yaml:** Has `supportedArchitectures` for linux only (os: linux) -- contradicts Windows ARM64 setup
- **React:** 18.3.1 via peerDependencies
- **Vite:** 6.3.5 with Tailwind 4.1.12
- **Heavy dependencies not visibly used:** react-dnd, react-slick, react-responsive-masonry, canvas-confetti, react-hook-form, cmdk, motion, next-themes, vaul, input-otp, react-day-picker, react-popper, embla-carousel-react, react-resizable-panels, recharts
- **MUI installed but not used:** @mui/material 7.3.5, @mui/icons-material, @emotion/react, @emotion/styled -- none imported

## 11. Recommended Refactoring Priorities

### Sprint 1 (High Priority)
1. Add React Router for URL-based navigation
2. Extract static data from components into a shared data layer (`src/data/` or `src/services/`)
3. Unify overlapping mock data between RegulationReview and RegulationReviewTable

### Sprint 2+ (Medium Priority)
4. Fix package name from `@figma/my-make-file` to `regulatory-intelligence`
5. Move React from peerDependencies to dependencies
6. Move `pnpm.overrides` from package.json to pnpm-workspace.yaml settings
7. Consider removing unused MUI dependencies (after confirming no future need)

### Later / Optional
8. Evaluate removal of unused shadcn/ui components (low risk but large file count)
9. Remove unused Sidebar.tsx (superseded by TopNav)
10. Remove unused ImageWithFallback.tsx
11. Clean up empty CSS files
12. Evaluate unused npm dependencies (react-dnd, react-slick, canvas-confetti, etc.)

## 12. Items That Should NOT Be Changed Yet

- **KIAA light theme and design tokens** (`kiaa-tokens.ts`, `theme.css`) -- must be preserved
- **Screen layouts and visual appearance** -- no redesign in Sprint 0
- **shadcn/ui components** -- removing 47 files carries risk and is not urgent
- **Major dependency versions** -- do not upgrade React, Vite, Tailwind, or MUI
- **Figma guidelines and attributions** -- reference material, leave in place
- **Inline styling approach** -- converting to Tailwind is a large change, defer
