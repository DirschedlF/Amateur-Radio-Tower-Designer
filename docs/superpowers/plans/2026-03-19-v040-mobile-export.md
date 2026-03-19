# v0.4.0 Mobile Layout & Bericht-Export — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add responsive mobile navigation (hamburger drawer) and a compact report export (print + HTML download) to the Amateur Radio Tower Designer.

**Architecture:** Mobile nav adds a `drawerOpen` state to `App.jsx` and converts `Sidebar` to a conditional overlay on small screens. The export lifts GuyWire load results to `App.jsx` (following the existing `windLoadSnapshot` pattern), extends the wind snapshot with pre-computed results, and adds two new files: `generateReport.js` (pure function) and `ReportButton.jsx` (button + portal popover).

**Tech Stack:** React 18, Vite 7, Tailwind CSS 3, Vitest. No new dependencies.

---

## File Map

| File | Action | Responsibility |
| --- | --- | --- |
| `src/i18n/translations.js` | Modify | Add 7 new i18n keys |
| `src/calculators/windload/WindLoadCalc.jsx` | Modify | Extend snapshot with 6 new fields |
| `src/calculators/guywire/GuyWireLoad.jsx` | Modify | Accept pre-computed `loadResult` prop; remove internal calc |
| `src/calculators/guywire/GuyWireCalc.jsx` | Modify | Lift load calc; emit `guyWireSnapshot`; pass `loadResult` down |
| `src/components/Sidebar.jsx` | Modify | Accept `isOpen` + `onClose`; responsive drawer CSS |
| `src/App.jsx` | Modify | `drawerOpen` state, hamburger, `guyWireSnapshot` state, `ReportButton` |
| `src/report/generateReport.js` | Create | Pure function → HTML string |
| `src/components/ReportButton.jsx` | Create | Button + fixed-portal popover |
| `tests/generateReport.test.js` | Create | Unit tests for `generateReport` |

---

## Task 1: Add i18n Keys

**Files:**
- Modify: `src/i18n/translations.js`

- [ ] **Step 1: Open `translations.js` and add the 7 new keys to both `de` and `en` objects**

In the `de` object, add after the last existing key:

```js
// Report export
reportButton: 'Bericht',
reportPrint: 'Drucken',
reportDownload: 'Herunterladen',
reportTitle: 'Mast-Designer Bericht',
reportDisclaimer: 'Planungsabschätzung — kein Ersatz für einen statischen Nachweis',
reportBothRequired: 'Beide Rechner müssen ausgefüllt sein',
reportPopupBlocked: 'Popup blockiert — bitte Popups für diese Seite erlauben',
```

In the `en` object, add the same keys:

```js
// Report export
reportButton: 'Report',
reportPrint: 'Print',
reportDownload: 'Download',
reportTitle: 'Mast Designer Report',
reportDisclaimer: 'Planning estimate — not a substitute for structural verification',
reportBothRequired: 'Both calculators must be filled in',
reportPopupBlocked: 'Popup blocked — please allow popups for this site',
```

- [ ] **Step 2: Run lint to confirm no syntax errors**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translations.js
git commit -m "feat(i18n): add report export translation keys"
```

---

## Task 2: Extend windLoadSnapshot

**Files:**
- Modify: `src/calculators/windload/WindLoadCalc.jsx`

The current snapshot (lines 50–59) is built from `config` and `results`. We add 6 new fields: 2 from `config.antenna`, 4 from `results`.

- [ ] **Step 1: Locate the snapshot object in `WindLoadCalc.jsx` (lines ~50–59)**

It currently looks like:
```js
const snapshot = {
  q: results.q,
  windSpeed: config.windSpeed,
  mastHeight: config.mast.height,
  diamBottomMm: config.mast.diamBottomMm,
  diamTopMm: config.mast.diamTopMm,
  mastCw: config.mast.cw,
  antennaForce: results.antenna.force,
  antennaMountHeight: config.antenna.mountHeight,
}
```

- [ ] **Step 2: Extend with 6 new fields**

```js
const snapshot = {
  q: results.q,
  windSpeed: config.windSpeed,
  mastHeight: config.mast.height,
  diamBottomMm: config.mast.diamBottomMm,
  diamTopMm: config.mast.diamTopMm,
  mastCw: config.mast.cw,
  antennaForce: results.antenna.force,
  antennaMountHeight: config.antenna.mountHeight,
  // New fields for report
  antennaArea: config.antenna.area,
  antennaCw: config.antenna.cw,
  mastForce: results.mast.force,
  mastMoment: results.mast.moment,
  totalForce: results.total.force,
  totalMoment: results.total.moment,
}
```

- [ ] **Step 3: Run tests to confirm nothing broke**

```bash
npm run test
```

Expected: all existing tests pass.

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/calculators/windload/WindLoadCalc.jsx
git commit -m "feat(windload): extend snapshot with antenna inputs and computed forces"
```

---

## Task 3: Refactor GuyWireLoad.jsx

**Files:**
- Modify: `src/calculators/guywire/GuyWireLoad.jsx`

Remove the internal `calculateGuyWireLoad` call. Accept `loadResult` prop (shape: `{ levels, q, windSpeed }` or `null`).

- [ ] **Step 1: Remove the import and internal useMemo**

Delete line 3 (`import { calculateGuyWireLoad } from './guywireload.js'`) and lines 14–24 (the `useMemo`). The component should no longer import or call `calculateGuyWireLoad`.

- [ ] **Step 2: Update the function signature**

Change:
```js
export default function GuyWireLoad({ windLoadSnapshot, geoResults, onNavigateToWindLoad }) {
```
To:
```js
export default function GuyWireLoad({ loadResult, onNavigateToWindLoad }) {
```

- [ ] **Step 3: Update all references inside the component**

Replace `loadResults` (from the old useMemo) with `loadResult` throughout:

- The null-check: `{!loadResult ? (` instead of `{!loadResults ? (`
- The summary line (line ~47): change `windLoadSnapshot.q` → `loadResult.q` and `windLoadSnapshot.windSpeed` → `loadResult.windSpeed`
- The table map (line ~69): change `loadResults.levels.map` → `loadResult.levels.map`

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: no errors. (There will be no test failures — GuyWireLoad has no unit tests, and the integration is verified in Task 4.)

- [ ] **Step 5: Commit**

```bash
git add src/calculators/guywire/GuyWireLoad.jsx
git commit -m "refactor(guywire): GuyWireLoad accepts pre-computed loadResult prop"
```

---

## Task 4: Lift Load Calculation into GuyWireCalc.jsx

**Files:**
- Modify: `src/calculators/guywire/GuyWireCalc.jsx`

Add `calculateGuyWireLoad` import, second `useMemo`, snapshot emission, and `onGuyWireChange` prop. Pass `loadResult` (enriched with `q`/`windSpeed`) to `GuyWireLoad`.

- [ ] **Step 1: Add the import**

After the existing imports, add:
```js
import { calculateGuyWireLoad } from './guywireload.js'
```

- [ ] **Step 2: Add the second useMemo after the existing `results` useMemo**

```js
const loadRaw = useMemo(() => {
  if (!windLoadSnapshot || !results) return null
  try {
    return calculateGuyWireLoad({ snapshot: windLoadSnapshot, levelResults: results.levels })
  } catch {
    return null
  }
}, [windLoadSnapshot, results])

const loadResult = loadRaw
  ? { levels: loadRaw.levels, q: windLoadSnapshot.q, windSpeed: windLoadSnapshot.windSpeed }
  : null
```

- [ ] **Step 3: Add `onGuyWireChange` prop and update the function signature**

Change:
```js
export default function GuyWireCalc({ windLoadSnapshot = null, onNavigateToWindLoad = () => {}, mastHeight = null, onMastHeightChange = () => {} }) {
```
To:
```js
export default function GuyWireCalc({ windLoadSnapshot = null, onNavigateToWindLoad = () => {}, mastHeight = null, onMastHeightChange = () => {}, onGuyWireChange = () => {} }) {
```

- [ ] **Step 4: Add the snapshot emission useEffect**

After the existing `useEffect` that syncs `mastHeight`, add:

```js
useEffect(() => {
  if (results === null) {
    onGuyWireChange(null)
    return
  }
  onGuyWireChange({
    mastHeight: config.mastHeight,
    levels: results.levels,
    grandTotalLength: results.grandTotalLength,
    loadResults: loadRaw?.levels ?? null,
  })
}, [results, loadRaw]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 5: Update the GuyWireLoad render call**

Change the `<GuyWireLoad>` props from:
```jsx
<GuyWireLoad
  windLoadSnapshot={windLoadSnapshot}
  geoResults={results}
  onNavigateToWindLoad={onNavigateToWindLoad}
/>
```
To:
```jsx
<GuyWireLoad
  loadResult={loadResult}
  onNavigateToWindLoad={onNavigateToWindLoad}
/>
```

- [ ] **Step 6: Run the app manually to verify load section still works**

```bash
npm run dev
```

Open http://localhost:5173. Set wind load data, then navigate to Abspannung. Verify the load section shows results as before.

- [ ] **Step 7: Run tests and lint**

```bash
npm run test && npm run lint
```

Expected: all tests pass, no lint errors.

- [ ] **Step 8: Commit**

```bash
git add src/calculators/guywire/GuyWireCalc.jsx
git commit -m "feat(guywire): lift load calc to GuyWireCalc, emit guyWireSnapshot"
```

---

## Task 5: Responsive Mobile Navigation

**Files:**
- Modify: `src/components/Sidebar.jsx`
- Modify: `src/App.jsx`

**Part A — Sidebar**

- [ ] **Step 1: Update Sidebar to accept `isOpen` and `onClose` props**

Change the function signature:
```js
export default function Sidebar({ activeCalc, onSelect, isOpen = false, onClose = () => {} }) {
```

- [ ] **Step 2: Add responsive drawer classes**

The `<aside>` currently has `className="w-44 bg-slate-800 border-r border-slate-700 flex-shrink-0 flex flex-col py-3"`.

Replace with:
```jsx
<aside className={`
  w-44 bg-slate-800 border-r border-slate-700 flex-shrink-0 flex flex-col py-3
  fixed inset-y-0 left-0 z-40 transition-transform duration-200
  md:static md:translate-x-0 md:z-auto
  ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
`}>
```

- [ ] **Step 3: Call `onClose` after navigation**

In the nav button's `onClick`, call both `onSelect(calc.id)` and `onClose()`:
```js
onClick={() => { onSelect(calc.id); onClose() }}
```

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

**Part B — App.jsx**

- [ ] **Step 5: Add `drawerOpen` state**

At the top of `App()`, after existing state:
```js
const [drawerOpen, setDrawerOpen] = useState(false)
```

- [ ] **Step 6: Add hamburger button to header**

In the header `<div className="flex items-center gap-3">`, add a hamburger button as the first child (before the emoji):
```jsx
<button
  onClick={() => setDrawerOpen(true)}
  className="md:hidden text-slate-400 hover:text-slate-100 text-xl px-1"
  aria-label="Open menu"
>
  ☰
</button>
```

- [ ] **Step 7: Add overlay backdrop**

Inside the `<div className="flex flex-1 overflow-hidden">`, before `<Sidebar>`, add:
```jsx
{drawerOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-30 md:hidden"
    onClick={() => setDrawerOpen(false)}
  />
)}
```

- [ ] **Step 8: Pass `isOpen` and `onClose` to Sidebar**

Update the `<Sidebar>` call:
```jsx
<Sidebar
  activeCalc={activeCalc}
  onSelect={setActiveCalc}
  isOpen={drawerOpen}
  onClose={() => setDrawerOpen(false)}
/>
```

- [ ] **Step 9: Add Escape key handler for drawer**

After the `drawerOpen` state declaration:
```js
useEffect(() => {
  if (!drawerOpen) return
  function handleKeyDown(e) {
    if (e.key === 'Escape') setDrawerOpen(false)
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [drawerOpen])
```

- [ ] **Step 10: Manually test on mobile viewport**

```bash
npm run dev
```

Open DevTools, switch to mobile viewport (375px width). Verify:
- Sidebar hidden by default
- Hamburger button visible in header
- Clicking hamburger opens sidebar drawer from left
- Clicking overlay closes drawer
- Clicking a nav item closes drawer
- Escape closes drawer
- On desktop (> 768px): sidebar always visible, hamburger hidden

- [ ] **Step 11: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add src/components/Sidebar.jsx src/App.jsx
git commit -m "feat(nav): responsive mobile drawer with hamburger menu"
```

---

## Task 6: generateReport.js (TDD)

**Files:**
- Create: `src/report/generateReport.js`
- Create: `tests/generateReport.test.js`

- [ ] **Step 1: Write the failing tests first**

Create `tests/generateReport.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { generateReport } from '../src/report/generateReport.js'

const windSnapshot = {
  q: 534, windSpeed: 22.5, mastHeight: 12,
  diamBottomMm: 100, diamTopMm: 60, mastCw: 1.1,
  antennaForce: 42, antennaMountHeight: 11,
  antennaArea: 0.5, antennaCw: 0.8,
  mastForce: 192, mastMoment: 1152,
  totalForce: 234, totalMoment: 1614,
}

const guyWireSnapshot = {
  mastHeight: 12,
  levels: [
    { height: 6, radius: 5, wires: 3, wireLength: 7.81, angleFromHorizontal: 50.2, angleFromMast: 39.8, totalLengthPerLevel: 23.43 },
    { height: 11, radius: 8, wires: 3, wireLength: 13.6, angleFromHorizontal: 53.97, angleFromMast: 36.03, totalLengthPerLevel: 40.8 },
  ],
  grandTotalLength: 64.23,
  loadResults: [
    { sectionForce: 98, horizForcePerWire: 32.7, tension: 51.4, tensionKgf: 5.24 },
    { sectionForce: 136, horizForcePerWire: 45.3, tension: 76.9, tensionKgf: 7.84 },
  ],
}

describe('generateReport', () => {
  it('returns a complete HTML document', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toMatch(/^<!DOCTYPE html>/)
    expect(html).toMatch(/<\/html>$/)
  })

  it('contains wind speed from snapshot', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('22.5')
  })

  it('contains total force from snapshot', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('234')
  })

  it('contains guy wire level height', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('6')
  })

  it('renders load table when loadResults is present', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('98') // sectionForce of level 1
  })

  it('omits load table when loadResults is null', () => {
    const snap = { ...guyWireSnapshot, loadResults: null }
    const html = generateReport({ windSnapshot, guyWireSnapshot: snap, lang: 'de' })
    // sectionForce values should not appear
    expect(html).not.toContain('>98<')
  })

  it('uses German labels for lang=de', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('Mast-Designer Bericht')
  })

  it('uses English labels for lang=en', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'en' })
    expect(html).toContain('Mast Designer Report')
  })

  it('includes print media query', () => {
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang: 'de' })
    expect(html).toContain('@media print')
  })
})
```

- [ ] **Step 2: Run tests to confirm they all fail**

```bash
npm run test tests/generateReport.test.js
```

Expected: all 9 tests FAIL with "Cannot find module".

- [ ] **Step 3: Create the file and implement `generateReport`**

Create `src/report/generateReport.js`:

```js
import { translations } from '../i18n/translations.js'

export function generateReport({ windSnapshot, guyWireSnapshot, lang }) {
  const t = (key) => translations[lang]?.[key] ?? translations['de'][key] ?? key

  const date = new Date().toLocaleDateString('sv-SE')

  const fmt = (n, d = 1) => (typeof n === 'number' ? n.toFixed(d) : '—')

  const gustFactor = windSnapshot.windSpeed > 0
    ? (windSnapshot.q / (0.5 * 1.25 * windSnapshot.windSpeed ** 2)).toFixed(2)
    : '—'

  const loadTableHtml = guyWireSnapshot.loadResults
    ? `
      <section style="grid-column:1/-1;margin-top:16px;">
        <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin-bottom:6px;">${t('loadSectionTitle')}</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="text-align:left;padding:4px 8px;border:1px solid #e2e8f0;">${t('colLevel')}</th>
              <th style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${t('colSectionForce')} (N)</th>
              <th style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${t('colHorizPerWire')} (N)</th>
              <th style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${t('colTension')} (N)</th>
              <th style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${t('colTension')} (kgf)</th>
            </tr>
          </thead>
          <tbody>
            ${guyWireSnapshot.loadResults.map((lvl, i) => `
              <tr>
                <td style="padding:4px 8px;border:1px solid #e2e8f0;">${i + 1}</td>
                <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(lvl.sectionForce, 0)}</td>
                <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(lvl.horizForcePerWire, 0)}</td>
                <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(lvl.tension, 0)}</td>
                <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(lvl.tensionKgf, 1)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>`
    : ''

  const levelsHtml = guyWireSnapshot.levels.map((lvl, i) => `
    <tr>
      <td style="padding:3px 6px;border:1px solid #e2e8f0;">${i + 1}</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.height)}</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.radius)}</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${lvl.wires}</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.wireLength)}</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.angleFromHorizontal)}°</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.angleFromMast)}°</td>
      <td style="text-align:right;padding:3px 6px;border:1px solid #e2e8f0;">${fmt(lvl.totalLengthPerLevel)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t('reportTitle')}</title>
<style>
  *{box-sizing:border-box;}
  body{font-family:system-ui,sans-serif;font-size:13px;color:#1e293b;background:#fff;margin:24px;line-height:1.5;}
  h1{font-size:18px;margin:0 0 2px;}
  h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin:0 0 6px;}
  .meta{font-size:11px;color:#64748b;margin-bottom:16px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .section{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;}
  table{width:100%;border-collapse:collapse;font-size:12px;}
  th,td{padding:3px 6px;border:1px solid #e2e8f0;}
  th{background:#f1f5f9;text-align:left;}
  td.r{text-align:right;}
  .kv{display:flex;justify-content:space-between;gap:8px;padding:2px 0;border-bottom:1px solid #f1f5f9;}
  .kv:last-child{border-bottom:none;}
  .label{color:#64748b;}
  .value{font-weight:500;}
  footer{margin-top:16px;font-size:10px;color:#94a3b8;text-align:center;}
  @media print{body{margin:0;}}
  @media(max-width:600px){.grid{grid-template-columns:1fr;}}
</style>
</head>
<body>
<h1>📡 ${t('reportTitle')}</h1>
<p class="meta">v0.4.0 · ${date}</p>

<div class="grid">
  <div class="section">
    <h3>${t('calcWindLoad')}</h3>
    <div class="kv"><span class="label">${t('windSpeed') ?? 'Windgeschwindigkeit'}</span><span class="value">${fmt(windSnapshot.windSpeed, 1)} m/s</span></div>
    <div class="kv"><span class="label">q</span><span class="value">${fmt(windSnapshot.q, 0)} N/m²</span></div>
    <div class="kv"><span class="label">${t('gustFactor') ?? 'Böenfaktor'}</span><span class="value">${gustFactor}</span></div>
    <div class="kv"><span class="label">${t('mastHeight') ?? 'Masthöhe'}</span><span class="value">${fmt(windSnapshot.mastHeight, 1)} m</span></div>
    <div class="kv"><span class="label">⌀ ${t('bottom') ?? 'unten'}</span><span class="value">${fmt(windSnapshot.diamBottomMm, 0)} mm</span></div>
    <div class="kv"><span class="label">⌀ ${t('top') ?? 'oben'}</span><span class="value">${fmt(windSnapshot.diamTopMm, 0)} mm</span></div>
    <div class="kv"><span class="label">cw ${t('mast') ?? 'Mast'}</span><span class="value">${fmt(windSnapshot.mastCw, 2)}</span></div>
    <div class="kv"><span class="label">${t('antennaArea') ?? 'Antennenfläche'}</span><span class="value">${fmt(windSnapshot.antennaArea, 2)} m²</span></div>
    <div class="kv"><span class="label">cw ${t('antenna') ?? 'Antenne'}</span><span class="value">${fmt(windSnapshot.antennaCw, 2)}</span></div>
    <div class="kv"><span class="label">${t('mountHeight') ?? 'Montagehöhe'}</span><span class="value">${fmt(windSnapshot.antennaMountHeight, 1)} m</span></div>
    <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;">
      <div class="kv"><span class="label">${t('mastForce') ?? 'Windkraft Mast'}</span><span class="value">${fmt(windSnapshot.mastForce, 0)} N</span></div>
      <div class="kv"><span class="label">${t('antennaForce') ?? 'Windkraft Antenne'}</span><span class="value">${fmt(windSnapshot.antennaForce, 0)} N</span></div>
      <div class="kv"><span class="label"><strong>${t('totalForce') ?? 'Gesamtkraft'}</strong></span><span class="value"><strong>${fmt(windSnapshot.totalForce, 0)} N</strong></span></div>
      <div class="kv"><span class="label">${t('totalMoment') ?? 'Biegemoment'}</span><span class="value">${fmt(windSnapshot.totalMoment, 0)} Nm</span></div>
    </div>
  </div>

  <div class="section">
    <h3>${t('calcGuyWire')}</h3>
    <table>
      <thead>
        <tr>
          <th>${t('colLevel')}</th>
          <th class="r">${t('heightLabel') ?? 'h (m)'}</th>
          <th class="r">${t('radiusLabel') ?? 'r (m)'}</th>
          <th class="r">${t('wiresLabel') ?? 'n'}</th>
          <th class="r">${t('colWireLength')}</th>
          <th class="r">${t('colAngleH')}</th>
          <th class="r">${t('colAngleM')}</th>
          <th class="r">${t('colTotalLevel')}</th>
        </tr>
      </thead>
      <tbody>${levelsHtml}</tbody>
    </table>
    <div class="kv" style="margin-top:8px;"><span class="label"><strong>${t('grandTotal')}</strong></span><span class="value"><strong>${fmt(guyWireSnapshot.grandTotalLength)} m</strong></span></div>
  </div>

  ${loadTableHtml}
</div>

<footer>${t('reportDisclaimer')}</footer>
</body>
</html>`
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test tests/generateReport.test.js
```

Expected: all 9 tests PASS.

- [ ] **Step 5: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/report/generateReport.js tests/generateReport.test.js
git commit -m "feat(report): add generateReport pure function with unit tests"
```

---

## Task 7: ReportButton.jsx

**Files:**
- Create: `src/components/ReportButton.jsx`

- [ ] **Step 1: Create `src/components/ReportButton.jsx`**

```jsx
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { generateReport } from '../report/generateReport.js'

export default function ReportButton({ windSnapshot, guyWireSnapshot, onCloseDrawer = () => {} }) {
  const { t, lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)

  const disabled = !windSnapshot || !guyWireSnapshot

  function handleOpen() {
    onCloseDrawer()
    const rect = btnRef.current.getBoundingClientRect()
    const right = window.innerWidth - rect.right
    setPos({ top: rect.bottom + 6, right: Math.max(right, 4) })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    function onMouse(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouse)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onMouse)
    }
  }, [open])

  function handlePrint() {
    setOpen(false)
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang })
    const w = window.open('', '_blank')
    if (!w) { alert(t('reportPopupBlocked')); return }
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 250)
  }

  function handleDownload() {
    setOpen(false)
    const html = generateReport({ windSnapshot, guyWireSnapshot, lang })
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mast-bericht-${new Date().toISOString().slice(0, 10)}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={disabled ? undefined : handleOpen}
        disabled={disabled}
        title={disabled ? t('reportBothRequired') : undefined}
        className={`text-sm px-3 py-1 rounded-full transition-colors ${
          disabled
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
        }`}
      >
        {t('reportButton')}
      </button>

      {open && createPortal(
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            right: pos.right,
            zIndex: 50,
            width: 'min(220px, 90vw)',
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
        >
          <button
            onClick={handlePrint}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
          >
            🖨️ {t('reportPrint')}
          </button>
          <button
            onClick={handleDownload}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors border-t border-slate-700"
          >
            ⬇️ {t('reportDownload')}
          </button>
        </div>,
        document.body
      )}
    </>
  )
}
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ReportButton.jsx
git commit -m "feat(report): add ReportButton with print and download actions"
```

---

## Task 8: Wire App.jsx

**Files:**
- Modify: `src/App.jsx`

Add `guyWireSnapshot` state, pass `onGuyWireChange` to `GuyWireCalc`, and add `ReportButton` to the header.

- [ ] **Step 1: Add the import**

At the top of `App.jsx`, add:
```js
import ReportButton from './components/ReportButton.jsx'
```

- [ ] **Step 2: Add `guyWireSnapshot` state**

After `const [windLoadSnapshot, setWindLoadSnapshot] = useState(null)`, add:
```js
const [guyWireSnapshot, setGuyWireSnapshot] = useState(null)
```

- [ ] **Step 3: Pass `onGuyWireChange` to `GuyWireCalc`**

In the `GuyWireCalc` JSX, add the prop:
```jsx
<GuyWireCalc
  windLoadSnapshot={windLoadSnapshot}
  onNavigateToWindLoad={() => setActiveCalc('windload')}
  mastHeight={sharedMastHeight}
  onMastHeightChange={setSharedMastHeight}
  onGuyWireChange={setGuyWireSnapshot}
/>
```

- [ ] **Step 4: Add `ReportButton` to the header**

In the header's right-side button group (currently just the lang toggle), add `ReportButton` before it:
```jsx
<div className="flex items-center gap-2">
  <ReportButton
    windSnapshot={windLoadSnapshot}
    guyWireSnapshot={guyWireSnapshot}
    onCloseDrawer={() => setDrawerOpen(false)}
  />
  <button
    onClick={toggleLang}
    className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1 rounded-full transition-colors"
  >
    {t('langToggle')}
  </button>
</div>
```

- [ ] **Step 5: Manual end-to-end test**

```bash
npm run dev
```

Test the full flow:
1. Fill in Windlast-Rechner (set wind speed, dimensions)
2. Switch to Abspannungsrechner (mast height syncs)
3. Verify load table appears in Abspannungsrechner
4. Click "Bericht" button in header → popover appears with Drucken + Herunterladen
5. Click "Drucken" → new window opens with report, print dialog appears
6. Click "Herunterladen" → HTML file downloads
7. On mobile viewport: verify hamburger works, ReportButton visible, drawer closes when Bericht clicked

- [ ] **Step 6: Run all tests and lint**

```bash
npm run test && npm run lint
```

Expected: all tests pass, no lint errors.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire guyWireSnapshot state and ReportButton in App"
```

---

## Task 9: Version Bump and Final Build

**Files:**
- Modify: `src/App.jsx` (version string)
- Modify: `package.json`

- [ ] **Step 1: Update version string in header**

In `App.jsx`, change:
```jsx
<span className="text-xs text-slate-500 font-mono">v0.3.0</span>
```
To:
```jsx
<span className="text-xs text-slate-500 font-mono">v0.4.0</span>
```

- [ ] **Step 2: Update package.json version**

Change `"version": "0.3.0"` to `"version": "0.4.0"`.

- [ ] **Step 3: Run production build to verify no build errors**

```bash
npm run build
```

Expected: build completes without errors.

- [ ] **Step 4: Run standalone build**

```bash
npm run build:standalone
```

Expected: builds without errors. Verify the output in `dist-standalone/`.

- [ ] **Step 5: Run full test suite one final time**

```bash
npm run test && npm run lint
```

Expected: all tests pass, no lint errors.

- [ ] **Step 6: Final commit**

```bash
git add src/App.jsx package.json
git commit -m "chore: bump version to 0.4.0"
```
