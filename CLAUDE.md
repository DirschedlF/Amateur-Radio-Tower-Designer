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

- `windLoadSnapshot` (null | object) — emitted by `WindLoadCalc` via `onWindLoadChange` prop, passed to `GuyWireCalc`
- `guyWireSnapshot` (null | object) — emitted by `GuyWireCalc` via `onGuyWireChange` prop; used by `ReportButton`
- `sharedMastHeight` (number) — synced bidirectionally between both calculators via `mastHeight` prop + `onMastHeightChange` callback
- `drawerOpen` (boolean) — controls mobile sidebar drawer; toggled by hamburger button and overlay click

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
- `GuyWireCalc.jsx` calls `calculateGuyWireLoad` internally via second `useMemo` → derives `loadResult = { levels, q, windSpeed } | null` → passes to `GuyWireLoad`; emits `guyWireSnapshot` via `useEffect([results, loadRaw])` + `onGuyWireChange` prop
- `GuyWireLoad.jsx` child: props `{ loadResult, onNavigateToWindLoad }` — empty state when `loadResult === null`, results table otherwise (section force, horiz/wire, tension N + kgf)
- `guywireload.js`: `calculateGuyWireLoad({ snapshot, levelResults })` — moment method: `R_i = M_section_i / h_i` where `M_section = q×cw×∫d(z)×z dz` (conical mast, midpoint-rule section boundaries); antenna moment `F_ant × h_ant` added to top-level section
- `guyWireSnapshot` shape: `{ mastHeight, levels, grandTotalLength, loadResults: array | null }`
- Layout: no `max-w-*` on outer wrapper — table needs full width (`whitespace-nowrap` on `<th>` and wire-length `<td>`)
- `GuyWireDiagram.jsx`: uniform scale `scale = min(availH/mastHeight, availW/maxRadius)` preserves real wire angles in the SVG

**Wind Load Calculator** (`src/calculators/windload/`):

- Physics: `q = 0.5 × 1.25 × v² × gustFactor` (default 1.7). Mast area = trapezoid (conical mast).
- Emits snapshot via `useEffect([memoised])` → `onWindLoadChange` prop
- Snapshot: `{ q, windSpeed, mastHeight, diamBottomMm, diamTopMm, mastCw, antennaForce, antennaMountHeight, antennaArea, antennaCw, mastForce, mastMoment, totalForce, totalMoment }`
- `windSpeed` is canonical; q is derived (`0.5 × 1.25 × v² × gustFactor`) and shown as a read-only display — not editable
- `handleConfigChange` clamps `antenna.mountHeight` to `mast.height` (`Math.min`) — same clamp in the mastHeight sync `useEffect`; `wasAtTop` pattern: if antenna was at (or above) mast top when mast height changes, antenna follows to new top instead of being clamped down

**Mobile Navigation:**

- `Sidebar.jsx` accepts `isOpen` + `onClose` props; uses `fixed` positioning + CSS `translate-x` for drawer behavior on mobile; `md:static` restores normal flow on desktop
- `App.jsx` adds hamburger button (`md:hidden`), overlay backdrop, Escape-key handler — all gated on `drawerOpen` state

**Tooltip component (`src/components/Tooltip.jsx`):**

- Props: `content` (ReactNode), `align` (`'left'` | `'right'`). Hover + click toggle. `relative inline-block` wrapper, `absolute z-50` popup, `w-72`. Used in `WindLoadInputs.jsx` for wind speed reference values.

**Header links:**

- `App.jsx` header contains a Handbuch `<a>` link (opens GitHub `docs/Benutzerhandbuch.md` in new tab) and the `ReportButton`. Both use `t('handbuchLink')` / `t('reportButton')` for i18n.

**Report Export (`src/report/`, `src/components/ReportButton.jsx`):**

- `generateReport({ windSnapshot, guyWireSnapshot, lang })` — pure function, returns full HTML string; imports translations directly (`translations[lang][key]`); no React
- `ReportButton.jsx` — button + portal popover (`createPortal` into `document.body`, `position: fixed`); disabled when either snapshot is null; calls `onCloseDrawer()` before opening popover; print via `window.open` + `setTimeout(() => w.print(), 250)`; download via `Blob` + `URL.createObjectURL`
- `ReportButton` is enabled only when both `windLoadSnapshot !== null` AND `guyWireSnapshot !== null`

## Known Debt

- `guywire.js`: `mastHeight` is accepted in the function signature but unused — reserved for future validation. Has `eslint-disable-line no-unused-vars`.
- `Sidebar.jsx`: `active` property on `CALCULATORS` entries is declared but never read.
- Input validation: clearing a number field silently falls back to `0` — no user feedback for invalid inputs.
