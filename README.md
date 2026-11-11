# ShelfAware front end

The SSF inventory app for the Seneca capstone: one shared inventory system with a workflow for each of SSF's three locations (Warehouse, Gaming room, Snack stand).

This is the React version of the clickable prototype (`ssf.html`). It behaves the same way: there is no backend yet, the data is sample data from the stakeholder brief (v0.2), and changes are saved in this browser's `localStorage`. Use **Reset demo** in the sidebar to start over.

## Getting started

Requires Node 20 or later.

```sh
npm install
npm run dev          # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Lint with oxlint |
| `npm test` | Unit tests for the domain logic (Vitest) |
| `npm run test:e2e` | Click-through smoke test of every main flow, including no sideways scrolling at 390px (Playwright) |
| `npm run check` | All of the above checks |

The first time you run the end-to-end tests, install the browser: `npx playwright install chromium`.

QR scanning with the camera needs a secure context (https or localhost) and `BarcodeDetector` (Chrome on Android, some desktop Chrome). Typing the box number always works.

## Project layout

```
src/
  main.jsx               Entry point
  app/                   App shell and provider stack
  data/seed.js           Sample data (the initial state)
  lib/                   Framework-free helpers: formatting, constants, QR, storage, photos
  state/
    StoreContext.jsx     App state, Immer updates, persistence
    SessionContext.jsx   Who is signed in (manager or staff)
    UiContext.jsx        View state: page, selected box, searches, filters
    selectors.js         Derived values (stock status, flags, audit progress...)
    sales.js             Square sales figures
    actions/             State changes, one file per location
  components/
    ui/                  Reusable building blocks: Button, Chip, Panel, StatStrip, form fields...
    feedback/            Toast, modal manager, FormDialog
    labels/              QR code, box label, printing
    layout/              Sidebar
  features/
    warehouse/           Page, panels (components/) and modals (modals/)
    gaming/
    snack/
  styles/                Design tokens and global styles
tests/
  unit/                  Vitest
  e2e/                   Playwright
docs/architecture.md     How the pieces fit together, and conventions
```

Read [docs/architecture.md](docs/architecture.md) before adding a feature.
