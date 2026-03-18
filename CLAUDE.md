# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server (Vite, port 5173)
npm run build            # Production build → dist/
npm run build:standalone # Single HTML file → dist-standalone/ (offline use)
npm run preview          # Preview production build
npm run lint             # ESLint strict (--max-warnings 0)
npm run test             # Run Vitest unit tests
npm run test:watch       # Vitest watch mode
```

## Tech Stack

React 18 + Vite 7 + Tailwind CSS 3 (dark theme). ESLint 9 flat config (`eslint.config.js`). Unit tests via Vitest. Dual-build via `vite-plugin-singlefile` + `cross-env BUILD_MODE=singlefile`.

## Architecture

**Multi-tool framework:** `App.jsx` routes between calculators via a `CALC_COMPONENTS` map. `Sidebar.jsx` lists active and coming-soon calculators. Adding a new calculator = add to `CALC_COMPONENTS` + `Sidebar.jsx` + `translations.js`.

**i18n:** Custom, no external library. `src/i18n/translations.js` holds all DE/EN strings. `src/hooks/useLanguage.jsx` provides `{ lang, t, toggleLang }` via React context. Language preference persisted to `localStorage`. Import as `.jsx` (file contains JSX).

**Calculator pattern** (`src/calculators/<name>/`):
- `<Name>.js` — pure calculation logic, no React, unit-tested in `tests/<name>.test.js`
- `<Name>Calc.jsx` — orchestrator: owns state, calls pure function via `useMemo`, passes results down
- Child components (`<Name>Inputs.jsx`, `<Name>Diagram.jsx`, `<Name>Results.jsx`) receive props only

**Guy Wire Calculator** (first calculator, geometric only — force/load calculations planned):
- Inputs: mast height, 1/2/3 guy wire levels, per-level height + anchor radius + wire count (3 or 4)
- Outputs: wire length, angle from horizontal, angle from mast, total per level, grand total
- SVG side-view diagram + results table, both color-coded by level
- Layout: `GuyWireCalc.jsx` uses no `max-w-*` on the outer wrapper — the results table needs full width to fit all German column headers without wrapping (`whitespace-nowrap` on `<th>` and wire-length `<td>`)

## Known Debt

- `guywire.js`: `mastHeight` is accepted in the function signature but unused — reserved for future validation. Has `eslint-disable-line no-unused-vars`.
- `Sidebar.jsx`: `active` property on `CALCULATORS` entries is declared but never read.
- Input validation: clearing a number field silently falls back to `0` — no user feedback for invalid inputs.
