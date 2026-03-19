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

**Multi-calculator routing:** `App.jsx` renders both calculators always, wrapped in `<div className={active ? '' : 'hidden'}>` to preserve state across navigation. No `CALC_COMPONENTS` map — per-key conditional rendering. Adding a new calculator = add per-key block in `App.jsx` + `Sidebar.jsx` + `translations.js`.

**Shared state in `App.jsx`:**

- `windLoadSnapshot` (null | object) — emitted by `WindLoadCalc` via `onWindLoadChange` prop, passed to `GuyWireCalc` → `GuyWireLoad`
- `sharedMastHeight` (number) — synced bidirectionally between both calculators via `mastHeight` prop + `onMastHeightChange` callback

**Mast height sync pattern:** Each calculator accepts `mastHeight` + `onMastHeightChange`. A `useEffect([mastHeight])` updates internal config when the prop changes (functional update, early-return if already equal). `handleConfigChange` calls `onMastHeightChange` when the local value differs. No feedback loops.

**i18n:** Custom, no external library. `src/i18n/translations.js` holds all DE/EN strings. `src/hooks/useLanguage.jsx` provides `{ lang, t, toggleLang }` via React context. Language preference persisted to `localStorage`. Import as `.jsx` (file contains JSX).

**Calculator pattern** (`src/calculators/<name>/`):

- `<Name>.js` — pure calculation logic, no React, unit-tested in `tests/<name>.test.js`
- `<Name>Calc.jsx` — orchestrator: owns state, calls pure function via `useMemo`, passes results down
- Child components (`<Name>Inputs.jsx`, `<Name>Diagram.jsx`, `<Name>Results.jsx`) receive props only

**Guy Wire Calculator** (`src/calculators/guywire/`):

- Inputs: mast height, 1/2/3 levels, per-level height + anchor radius + wire count (3 or 4)
- Outputs: wire length, angle from horizontal, angle from mast, total per level, grand total + load section
- `guywire.js` level objects include `height` and `radius` (needed by load calc)
- `GuyWireLoad.jsx` child: empty state (no snapshot) or results table (section force, horiz/wire, tension N + kgf)
- `guywireload.js`: `calculateGuyWireLoad({ snapshot, levelResults })` — sectional method, midpoint-rule boundaries, antenna force always to top level
- Layout: no `max-w-*` on outer wrapper — table needs full width (`whitespace-nowrap` on `<th>` and wire-length `<td>`)

**Wind Load Calculator** (`src/calculators/windload/`):

- Physics: `q = 0.5 × 1.25 × v² × gustFactor` (default 1.7). Mast area = trapezoid (conical mast).
- Emits snapshot via `useEffect([memoised])` → `onWindLoadChange` prop
- Snapshot: `{ q, windSpeed, mastHeight, diamBottomMm, diamTopMm, mastCw, antennaForce, antennaMountHeight }`
- `windSpeed` is canonical; q field uses `defaultValue + key={derivedQ} + onBlur` to avoid cursor-jumping
- `handleConfigChange` clamps `antenna.mountHeight` to `mast.height` (`Math.min`) — same clamp in the mastHeight sync `useEffect`

## Known Debt

- `guywire.js`: `mastHeight` is accepted in the function signature but unused — reserved for future validation. Has `eslint-disable-line no-unused-vars`.
- `Sidebar.jsx`: `active` property on `CALCULATORS` entries is declared but never read.
- Input validation: clearing a number field silently falls back to `0` — no user feedback for invalid inputs.
