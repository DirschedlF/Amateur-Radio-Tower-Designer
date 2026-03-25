# Spider Beam Mast-Konfigurator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone Spider Beam Mast-Konfigurator calculator that lets users configure a Spiderbeam 14m HD telescoping mast, select guy wire attachment points, and transfer the configuration to the existing guy wire calculator via a confirmation dialog.

**Architecture:** Fully decoupled new calculator — no shared reactive state. SpiderBeamCalc calls `onConfigureGuyWire(config)` when the user clicks the transfer button, triggering a confirmation dialog in App.jsx. On confirmation, `confirmedPrefill` is passed as a one-shot prop to GuyWireCalc. After that, the two calculators are completely independent.

**Tech Stack:** React 18, Vite 7, Tailwind CSS 3 (dark theme), Vitest for unit tests, custom i18n via `useLanguage` hook (`src/hooks/useLanguage.jsx`).

---

## File Map

### New Files

| File | Responsibility |
|---|---|
| `src/calculators/spiderbeam/spiderbeam.js` | Pure calculation: active segments, attachment point heights, availability |
| `src/calculators/spiderbeam/SpiderBeamCalc.jsx` | Orchestrator: holds `desiredHeight` + `activeGuyLevels` state, calls pure fn via `useMemo` |
| `src/calculators/spiderbeam/SpiderBeamDiagram.jsx` | SVG mast diagram (Grundrohr, active segments, attachment points with guy wire lines) |
| `src/calculators/spiderbeam/SpiderBeamResults.jsx` | Right panel: height input, clickable attachment points, transfer box + button |
| `tests/spiderbeam.test.js` | Unit tests for `spiderbeam.js` |

### Modified Files

| File | Change |
|---|---|
| `src/i18n/translations.js` | Add ~17 new i18n keys (DE + EN) |
| `src/components/Sidebar.jsx` | Add `'spiderbeam'` entry to `CALCULATORS` array |
| `src/App.jsx` | Add `pendingPrefill`/`confirmedPrefill` state, confirmation dialog, SpiderBeamCalc mount |
| `src/calculators/guywire/GuyWireCalc.jsx` | Add `prefill` prop + `useEffect` to apply it |

---

## Task 1: i18n Keys

**Files:**
- Modify: `src/i18n/translations.js`

- [ ] **Step 1: Add DE keys** — append inside the `de` object, after the last existing key

```js
// Spider Beam Mast-Konfigurator
calcSpiderBeam: 'Spider Beam',
calcSpiderBeamSubtitle: 'Mast-Konfigurator',
spiderBeamMastLabel: 'Masttyp',
spiderBeamHeight: 'Masthöhe',
spiderBeamHeightUnit: 'm (1–14)',
spiderBeamSegmentsActive: 'Segmente ausgezogen',
spiderBeamInGroundtube: 'im Grundrohr',
spiderBeamGuyLevels: 'Abspannpunkte',
spiderBeamSegment: 'Segment',
spiderBeamTransferTitle: 'Übergabe an Abspannungs-Rechner',
spiderBeamTransferPreview: 'Beim Öffnen werden folgende Werte übertragen:',
spiderBeamOpenGuyWire: 'Abspannungs-Rechner öffnen →',
spiderBeamConfirmTitle: 'Abspannrechner überschreiben?',
spiderBeamConfirmBody: 'Die aktuellen Werte im Abspannrechner werden ersetzt.',
spiderBeamConfirmYes: 'Ja, überschreiben',
spiderBeamConfirmCancel: 'Abbrechen',
spiderBeamNotActive: 'nicht aktiv',
```

- [ ] **Step 2: Add EN keys** — append inside the `en` object, after the last existing key

```js
// Spider Beam Mast-Konfigurator
calcSpiderBeam: 'Spider Beam',
calcSpiderBeamSubtitle: 'Mast Designer',
spiderBeamMastLabel: 'Mast type',
spiderBeamHeight: 'Mast height',
spiderBeamHeightUnit: 'm (1–14)',
spiderBeamSegmentsActive: 'Segments extended',
spiderBeamInGroundtube: 'in base tube',
spiderBeamGuyLevels: 'Guy wire levels',
spiderBeamSegment: 'Segment',
spiderBeamTransferTitle: 'Transfer to Guy Wire Calc',
spiderBeamTransferPreview: 'The following values will be transferred:',
spiderBeamOpenGuyWire: 'Open Guy Wire Calc →',
spiderBeamConfirmTitle: 'Overwrite guy wire calc?',
spiderBeamConfirmBody: 'The current values in the guy wire calc will be replaced.',
spiderBeamConfirmYes: 'Yes, overwrite',
spiderBeamConfirmCancel: 'Cancel',
spiderBeamNotActive: 'not active',
```

- [ ] **Step 3: Run lint**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/translations.js
git commit -m "feat(i18n): add Spider Beam Mast-Konfigurator translation keys"
```

---

## Task 2: Pure Calculation Logic + Tests

**Files:**
- Create: `src/calculators/spiderbeam/spiderbeam.js`
- Create: `tests/spiderbeam.test.js`

- [ ] **Step 1: Write the failing tests first**

Create `tests/spiderbeam.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { MAST_CONFIGS, calculateSpiderBeam } from '../src/calculators/spiderbeam/spiderbeam.js'

const cfg = MAST_CONFIGS['14m_hd']

describe('calculateSpiderBeam — H=14 (full height)', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 14, activeGuyLevels: [10, 12, 14] })

  it('no segments in groundtube', () => expect(r.inGroundtube).toEqual([]))
  it('segments 2–14 active', () => expect(r.activeSegments).toEqual([2,3,4,5,6,7,8,9,10,11,12,13,14]))
  it('attachment points at 9, 11, 13 m', () => expect(r.attachmentPoints.map(p => p.height)).toEqual([9, 11, 13]))
  it('all available', () => expect(r.attachmentPoints.every(p => p.available)).toBe(true))
  it('all active', () => expect(r.attachmentPoints.every(p => p.active)).toBe(true))
})

describe('calculateSpiderBeam — H=12', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 12, activeGuyLevels: [10, 12, 14] })

  it('segments 2+3 in groundtube', () => expect(r.inGroundtube).toEqual([2, 3]))
  it('segments 4–14 active', () => expect(r.activeSegments).toEqual([4,5,6,7,8,9,10,11,12,13,14]))
  it('attachment points at 7, 9, 11 m', () => expect(r.attachmentPoints.map(p => p.height)).toEqual([7, 9, 11]))
})

describe('calculateSpiderBeam — H=10', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 10, activeGuyLevels: [10, 12, 14] })
  it('attachment points at 5, 7, 9 m', () => expect(r.attachmentPoints.map(p => p.height)).toEqual([5, 7, 9]))
})

describe('calculateSpiderBeam — H=6 boundary (seg 10 just available)', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 6, activeGuyLevels: [10, 12, 14] })
  it('seg 10 available at H=6', () => {
    const p = r.attachmentPoints.find(p => p.segment === 10)
    expect(p.available).toBe(true)
    expect(p.height).toBe(1)
  })
})

describe('calculateSpiderBeam — H=5 boundary (seg 10 unavailable)', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 5, activeGuyLevels: [10, 12, 14] })
  it('seg 10 not available', () => {
    const p = r.attachmentPoints.find(p => p.segment === 10)
    expect(p.available).toBe(false)
    expect(p.active).toBe(false)
  })
})

describe('calculateSpiderBeam — H=4 (seg 12 available, seg 10 not)', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 4, activeGuyLevels: [10, 12, 14] })
  it('seg 12 available', () => expect(r.attachmentPoints.find(p => p.segment === 12).available).toBe(true))
  it('seg 10 not available', () => expect(r.attachmentPoints.find(p => p.segment === 10).available).toBe(false))
})

describe('calculateSpiderBeam — H=1 (only groundtube)', () => {
  const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 1, activeGuyLevels: [10, 12, 14] })
  it('no active segments', () => expect(r.activeSegments).toEqual([]))
  it('no attachment points available', () => expect(r.attachmentPoints.every(p => !p.available)).toBe(true))
})

describe('calculateSpiderBeam — toggle: deselected level is available but not active', () => {
  it('seg 14 available but not active when omitted', () => {
    const r = calculateSpiderBeam({ mastConfig: cfg, desiredHeight: 14, activeGuyLevels: [10, 12] })
    const p14 = r.attachmentPoints.find(p => p.segment === 14)
    expect(p14.available).toBe(true)
    expect(p14.active).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run test -- spiderbeam
```

Expected: All tests FAIL with "Cannot find module".

- [ ] **Step 3: Create `src/calculators/spiderbeam/spiderbeam.js`**

```js
/**
 * calculateSpiderBeam — pure logic for Spiderbeam telescoping mast configuration.
 *
 * Segment numbering: 1 = Grundrohr (base tube, always present at 0–1 m).
 * Segments 2–14 are the sliding sections, pulled out from the top (seg 14 first).
 *
 * For desired height H (1–14):
 *   Active segments (pulled out): N ∈ [2..14] where N ≥ (segments + 2 − H)
 *   In groundtube:                N ∈ [2..segments + 1 − H]
 *   Attachment point height for segment N: H + N − (segments + 1)
 *   Segment N is available when: H ≥ segments + 2 − N
 */

export const MAST_CONFIGS = {
  '14m_hd': {
    name: 'Spiderbeam 14m HD',
    segments: 14,
    segmentLength: 1.0,        // meters per segment
    guyLevels: [10, 12, 14],   // segment numbers of attachment points (ascending)
  },
  // '12m_hd': { … }  — future extension, not in scope
}

/**
 * @param {object}   params
 * @param {object}   params.mastConfig       - Entry from MAST_CONFIGS
 * @param {number}   params.desiredHeight    - 1–mastConfig.segments
 * @param {number[]} params.activeGuyLevels  - Segment numbers the user has toggled on
 * @returns {{
 *   activeSegments: number[],
 *   inGroundtube: number[],
 *   attachmentPoints: Array<{segment:number, height:number|null, available:boolean, active:boolean}>
 * }}
 */
export function calculateSpiderBeam({ mastConfig, desiredHeight, activeGuyLevels }) {
  const H = Math.max(1, Math.min(mastConfig.segments, Math.round(desiredHeight)))
  const { segments, guyLevels } = mastConfig

  // firstActive: lowest segment number that is pulled out
  // For 14-segment mast: firstActive = 16 - H (generalised: segments + 2 - H)
  const firstActive = segments + 2 - H

  const activeSegments = []
  const inGroundtube = []
  for (let n = 2; n <= segments; n++) {
    if (n >= firstActive) activeSegments.push(n)
    else inGroundtube.push(n)
  }

  const attachmentPoints = guyLevels.map(n => {
    const available = n >= firstActive
    // height formula: H + N - (segments + 1), e.g. H + N - 15 for 14-segment mast
    const height = available ? H + n - (segments + 1) : null
    return {
      segment: n,
      height,
      available,
      active: available && activeGuyLevels.includes(n),
    }
  })

  return { activeSegments, inGroundtube, attachmentPoints }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run test -- spiderbeam
```

Expected: All tests PASS.

- [ ] **Step 5: Run lint**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add src/calculators/spiderbeam/spiderbeam.js tests/spiderbeam.test.js
git commit -m "feat(spiderbeam): add pure calculation logic with unit tests"
```

---

## Task 3: SVG Diagram Component

**Files:**
- Create: `src/calculators/spiderbeam/SpiderBeamDiagram.jsx`

- [ ] **Step 1: Create `SpiderBeamDiagram.jsx`**

```jsx
/**
 * SpiderBeamDiagram — SVG side view of the Spiderbeam telescoping mast.
 *
 * Layout (left to right in SVG):
 *   - Height axis with tick labels (left side)
 *   - Grundrohr: blue filled rect at base (0–1 m)
 *   - Eingezogene Segmente: dashed overlay inside Grundrohr
 *   - Active mast: trapezoid (konisch), wider at bottom, narrower at top
 *   - Attachment points: yellow circle + horizontal line when active,
 *     grey circle + dashed line when deactivated
 *   - Guy wire lines: symbolic, fixed 60 px horizontal offset (not to scale)
 *   - Segment labels on the right side of each attachment point
 */

const SVG_W = 220
const SVG_H = 360
const AXIS_X = 38
const MAST_CX = 120
const MARGIN_TOP = 22
const MARGIN_BOTTOM = 32

const MAST_W_BOTTOM = 54   // px width of mast at 1 m (top of Grundrohr)
const MAST_W_TOP = 8       // px width of mast at desiredHeight
const GUY_OFFSET = 60      // symbolic horizontal distance for guy wire lines

export default function SpiderBeamDiagram({ config, results }) {
  const { desiredHeight } = config
  const { inGroundtube, activeSegments, attachmentPoints } = results

  const drawH = SVG_H - MARGIN_TOP - MARGIN_BOTTOM
  const scale = drawH / desiredHeight   // px per meter
  const groundY = SVG_H - MARGIN_BOTTOM

  function yOf(meters) {
    return groundY - meters * scale
  }

  function mastWidthAt(meters) {
    const frac = meters / desiredHeight
    return MAST_W_BOTTOM + (MAST_W_TOP - MAST_W_BOTTOM) * frac
  }

  // Grundrohr: segment 1, height 0–1 m
  const groundtubeTopY = yOf(1)
  const groundtubeH = groundY - groundtubeTopY

  // Active mast trapezoid: from 1 m to desiredHeight
  const wBottom = mastWidthAt(1)
  const wTop = mastWidthAt(desiredHeight)
  const trapPoints = [
    `${MAST_CX - wBottom / 2},${yOf(1)}`,
    `${MAST_CX + wBottom / 2},${yOf(1)}`,
    `${MAST_CX + wTop / 2},${yOf(desiredHeight)}`,
    `${MAST_CX - wTop / 2},${yOf(desiredHeight)}`,
  ].join(' ')

  return (
    <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 flex flex-col">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
        Seitenansicht · {desiredHeight} m
      </p>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        {/* Ground */}
        <line x1={10} y1={groundY} x2={SVG_W - 10} y2={groundY} stroke="#475569" strokeWidth={2} />
        <text x={MAST_CX} y={groundY + 14} textAnchor="middle" fontSize={9} fill="#64748b">0 m</text>

        {/* Height axis */}
        <line x1={AXIS_X} y1={groundY} x2={AXIS_X} y2={MARGIN_TOP}
          stroke="#1e3a5f" strokeWidth={1} strokeDasharray="2,4" />

        {/* Grundrohr */}
        <rect x={MAST_CX - MAST_W_BOTTOM / 2} y={groundtubeTopY}
          width={MAST_W_BOTTOM} height={groundtubeH}
          rx={2} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5} />
        <text x={MAST_CX} y={groundtubeTopY - 4} textAnchor="middle" fontSize={8} fill="#60a5fa">
          Grundrohr · Seg. 1
        </text>

        {/* Eingezogene Segmente (dashed overlay) */}
        {inGroundtube.length > 0 && (
          <rect x={MAST_CX - MAST_W_BOTTOM / 2 + 4} y={groundtubeTopY + 2}
            width={MAST_W_BOTTOM - 8} height={groundtubeH - 4}
            rx={1} fill="none" stroke="#334155" strokeWidth={1} strokeDasharray="3,2" />
        )}

        {/* Active mast trapezoid */}
        {activeSegments.length > 0 && (
          <polygon points={trapPoints} fill="#334155" stroke="#60a5fa" strokeWidth={1.5} />
        )}

        {/* Attachment points */}
        {attachmentPoints.map(({ segment, height, available, active }) => {
          if (!available) return null
          const py = yOf(height)
          const hw = mastWidthAt(height) / 2 + 4  // half-width with small margin

          return (
            <g key={segment}>
              <line x1={MAST_CX - hw} y1={py} x2={MAST_CX + hw} y2={py}
                stroke={active ? '#f59e0b' : '#475569'}
                strokeWidth={active ? 2 : 1.5}
                strokeDasharray={active ? undefined : '3,2'} />
              <circle cx={MAST_CX} cy={py} r={5}
                fill={active ? '#f59e0b' : '#1e293b'}
                stroke={active ? '#fbbf24' : '#475569'} strokeWidth={1.5} />
              {active && (
                <>
                  <line x1={MAST_CX} y1={py} x2={MAST_CX - GUY_OFFSET} y2={groundY}
                    stroke="#f59e0b" strokeWidth={1} opacity={0.5} strokeDasharray="5,3" />
                  <line x1={MAST_CX} y1={py} x2={MAST_CX + GUY_OFFSET} y2={groundY}
                    stroke="#f59e0b" strokeWidth={1} opacity={0.5} strokeDasharray="5,3" />
                </>
              )}
              <text x={AXIS_X - 4} y={py + 3} textAnchor="end" fontSize={9}
                fill={active ? '#f59e0b' : '#64748b'}>{height} m</text>
              <text x={MAST_CX + hw + 6} y={py + 3} fontSize={9}
                fill={active ? '#f59e0b' : '#64748b'}>Seg. {segment}</text>
            </g>
          )
        })}

        {/* Top label */}
        <text x={MAST_CX} y={MARGIN_TOP - 4} textAnchor="middle" fontSize={9} fill="#94a3b8">
          ▲ {desiredHeight} m
        </text>
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Run lint**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Commit**

```bash
git add src/calculators/spiderbeam/SpiderBeamDiagram.jsx
git commit -m "feat(spiderbeam): add SVG mast diagram component"
```

---

## Task 4: Results Panel Component

**Files:**
- Create: `src/calculators/spiderbeam/SpiderBeamResults.jsx`

- [ ] **Step 1: Create `SpiderBeamResults.jsx`**

```jsx
import { useLanguage } from '../../hooks/useLanguage.jsx'

export default function SpiderBeamResults({
  results,
  mastConfig,
  desiredHeight,
  activeGuyLevels,
  onHeightChange,
  onToggleLevel,
  onConfigureGuyWire,
}) {
  const { t } = useLanguage()
  const { activeSegments, inGroundtube, attachmentPoints } = results

  const selectedPoints = attachmentPoints.filter(p => p.active)

  function handleHeightInput(e) {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v)) onHeightChange(Math.max(1, Math.min(mastConfig.segments, v)))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mast label + height input */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-widest">{t('spiderBeamMastLabel')}:</span>
          <span className="text-slate-200 font-semibold text-sm">{mastConfig.name}</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-slate-400">{t('spiderBeamHeight')}</label>
          <input
            type="number"
            min={1}
            max={mastConfig.segments}
            value={desiredHeight}
            onChange={handleHeightInput}
            className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-center
              text-slate-100 focus:outline-none focus:border-blue-500"
          />
          <span className="text-xs text-slate-500">{t('spiderBeamHeightUnit')}</span>
        </div>

        <div className="text-xs text-green-400 bg-green-900/30 border border-green-800/50 rounded px-3 py-1.5 leading-relaxed">
          {activeSegments.length} {t('spiderBeamSegmentsActive')}
          {inGroundtube.length > 0 && (
            <> &nbsp;·&nbsp; Seg.&nbsp;{inGroundtube[0]}–{inGroundtube[inGroundtube.length - 1]}&nbsp;{t('spiderBeamInGroundtube')}</>
          )}
        </div>
      </div>

      {/* Attachment point toggles */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col gap-2">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{t('spiderBeamGuyLevels')}</p>
        {attachmentPoints.map(({ segment, height, available, active }) => (
          <button
            key={segment}
            disabled={!available}
            onClick={() => available && onToggleLevel(segment)}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left w-full transition-colors
              ${available
                ? active
                  ? 'bg-amber-900/30 border border-amber-700/50 hover:bg-amber-900/50'
                  : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                : 'opacity-40 bg-slate-800 border border-slate-700 cursor-not-allowed'
              }`}
          >
            <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center
              ${active ? 'bg-amber-500' : 'border-2 border-slate-500'}`}>
              {active && <span className="text-black text-xs font-bold leading-none">✓</span>}
            </div>
            <span className="text-sm font-medium text-slate-200 flex-1">
              {t('spiderBeamSegment')} {segment}
            </span>
            {available
              ? <span className="text-xs text-green-400 font-semibold">{height} m</span>
              : <span className="text-xs text-slate-500">{t('spiderBeamNotActive')}</span>
            }
          </button>
        ))}
      </div>

      {/* Transfer box */}
      <div className="bg-indigo-950/50 border border-indigo-800/50 rounded-lg p-4 flex flex-col gap-3">
        <p className="text-xs text-indigo-400 uppercase tracking-widest">{t('spiderBeamTransferTitle')}</p>
        <p className="text-xs text-slate-400">{t('spiderBeamTransferPreview')}</p>

        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <span className="text-indigo-400">{t('spiderBeamHeight')}:</span>
          <span className="text-slate-200 font-semibold">{desiredHeight} m</span>
          {selectedPoints.map((p, i) => (
            <div key={p.segment} className="contents">
              <span className="text-indigo-400">Ebene {i + 1}:</span>
              <span className="text-slate-200">
                {p.height} m <span className="text-slate-500 text-xs">(Seg. {p.segment})</span>
              </span>
            </div>
          ))}
          {selectedPoints.length === 0 && (
            <span className="col-span-2 text-slate-500 text-xs">— keine Abspannpunkte ausgewählt</span>
          )}
        </div>

        <button
          disabled={selectedPoints.length === 0}
          onClick={() => onConfigureGuyWire({
            mastHeight: desiredHeight,
            levels: selectedPoints.map(p => ({ segment: p.segment, height: p.height })),
          })}
          className="bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed
            text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
        >
          {t('spiderBeamOpenGuyWire')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run lint**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Commit**

```bash
git add src/calculators/spiderbeam/SpiderBeamResults.jsx
git commit -m "feat(spiderbeam): add results panel with attachment point toggles and transfer box"
```

---

## Task 5: Orchestrator Component

**Files:**
- Create: `src/calculators/spiderbeam/SpiderBeamCalc.jsx`

- [ ] **Step 1: Create `SpiderBeamCalc.jsx`**

```jsx
import { useState, useMemo } from 'react'
import { MAST_CONFIGS, calculateSpiderBeam } from './spiderbeam.js'
import SpiderBeamDiagram from './SpiderBeamDiagram.jsx'
import SpiderBeamResults from './SpiderBeamResults.jsx'

// One mast type in scope for this version — no mastType state needed.
const mastConfig = MAST_CONFIGS['14m_hd']

export default function SpiderBeamCalc({
  onConfigureGuyWire = () => {},
  onNavigateToGuyWire = () => {},
}) {
  const [desiredHeight, setDesiredHeight] = useState(mastConfig.segments)
  const [activeGuyLevels, setActiveGuyLevels] = useState([...mastConfig.guyLevels])

  const results = useMemo(
    () => calculateSpiderBeam({ mastConfig, desiredHeight, activeGuyLevels }),
    [desiredHeight, activeGuyLevels]
  )

  function handleToggleLevel(segment) {
    setActiveGuyLevels(prev =>
      prev.includes(segment) ? prev.filter(n => n !== segment) : [...prev, segment]
    )
  }

  function handleHeightChange(newHeight) {
    // Deactivate attachment points that become unavailable at the new height.
    // Recalculate availability with current activeGuyLevels, then filter.
    const next = calculateSpiderBeam({ mastConfig, desiredHeight: newHeight, activeGuyLevels })
    const availableSegments = next.attachmentPoints.filter(p => p.available).map(p => p.segment)
    setActiveGuyLevels(prev => prev.filter(n => availableSegments.includes(n)))
    setDesiredHeight(newHeight)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SpiderBeamDiagram config={{ desiredHeight }} results={results} />
        <SpiderBeamResults
          results={results}
          mastConfig={mastConfig}
          desiredHeight={desiredHeight}
          activeGuyLevels={activeGuyLevels}
          onHeightChange={handleHeightChange}
          onToggleLevel={handleToggleLevel}
          onConfigureGuyWire={onConfigureGuyWire}
          onNavigateToGuyWire={onNavigateToGuyWire}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run lint**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Commit**

```bash
git add src/calculators/spiderbeam/SpiderBeamCalc.jsx
git commit -m "feat(spiderbeam): add orchestrator component"
```

---

## Task 6: GuyWireCalc Prefill

**Files:**
- Modify: `src/calculators/guywire/GuyWireCalc.jsx`

Current signature (line 20):
```js
export default function GuyWireCalc({ windLoadSnapshot = null, onNavigateToWindLoad = () => {}, mastHeight = null, onMastHeightChange = () => {}, onGuyWireChange = () => {} }) {
```

- [ ] **Step 1: Add `prefill = null` to the function signature**

New signature:
```js
export default function GuyWireCalc({ windLoadSnapshot = null, onNavigateToWindLoad = () => {}, mastHeight = null, onMastHeightChange = () => {}, onGuyWireChange = () => {}, prefill = null }) {
```

- [ ] **Step 2: Add prefill `useEffect` after the existing `useEffect([mastHeight])` (after line 27)**

```js
useEffect(() => {
  if (!prefill) return
  setConfig(c => ({
    ...c,
    mastHeight: prefill.mastHeight,
    levels: prefill.levels.length,
    // Map over existing levelConfig — only overwrite height for prefilled levels,
    // keep radius/wires from existing config (prevents undefined entries).
    levelConfig: c.levelConfig.map((existing, i) =>
      i < prefill.levels.length
        ? { ...existing, height: prefill.levels[i].height }
        : existing
    ),
  }))
  onMastHeightChange(prefill.mastHeight)
}, [prefill]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 3: Run all tests**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run test
```

Expected: All tests PASS.

- [ ] **Step 4: Run lint**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 5: Commit**

```bash
git add src/calculators/guywire/GuyWireCalc.jsx
git commit -m "feat(guywire): add prefill prop for Spider Beam config transfer"
```

---

## Task 7: App.jsx + Sidebar.jsx Wiring

**Files:**
- Modify: `src/components/Sidebar.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add spiderbeam entry to Sidebar**

In `src/components/Sidebar.jsx`, replace the `CALCULATORS` array with:

```js
const CALCULATORS = [
  { id: 'guywire', labelKey: 'calcGuyWire', subtitleKey: 'calcGuyWireSubtitle', active: true },
  { id: 'windload', labelKey: 'calcWindLoad', subtitleKey: 'calcWindLoadSubtitle', active: true },
  { id: 'spiderbeam', labelKey: 'calcSpiderBeam', subtitleKey: 'calcSpiderBeamSubtitle', active: true },
]
```

- [ ] **Step 2: Add import in App.jsx**

After the existing imports in `src/App.jsx`, add:

```js
import SpiderBeamCalc from './calculators/spiderbeam/SpiderBeamCalc.jsx'
```

- [ ] **Step 3: Add pendingPrefill + confirmedPrefill state in App.jsx**

After `const [drawerOpen, setDrawerOpen] = useState(false)`, add:

```js
const [pendingPrefill, setPendingPrefill] = useState(null)
const [confirmedPrefill, setConfirmedPrefill] = useState(null)
```

- [ ] **Step 4: Add `prefill={confirmedPrefill}` to GuyWireCalc render**

Existing `<GuyWireCalc ...>` block — add the prop:

```jsx
<GuyWireCalc
  windLoadSnapshot={windLoadSnapshot}
  onNavigateToWindLoad={() => setActiveCalc('windload')}
  mastHeight={sharedMastHeight}
  onMastHeightChange={setSharedMastHeight}
  onGuyWireChange={setGuyWireSnapshot}
  prefill={confirmedPrefill}
/>
```

- [ ] **Step 5: Add SpiderBeamCalc block after the WindLoadCalc block (before `<footer>`)**

```jsx
<div className={activeCalc === 'spiderbeam' ? '' : 'hidden'}>
  <SpiderBeamCalc
    onConfigureGuyWire={setPendingPrefill}
    onNavigateToGuyWire={() => setActiveCalc('guywire')}
  />
</div>
```

- [ ] **Step 6: Add confirmation dialog inside `<main>`, just before `<footer>`**

```jsx
{pendingPrefill && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
      <h2 className="text-base font-semibold text-slate-100">{t('spiderBeamConfirmTitle')}</h2>
      <p className="text-sm text-slate-400">{t('spiderBeamConfirmBody')}</p>
      <div className="text-sm bg-slate-700/50 rounded-lg px-4 py-3 flex flex-col gap-1">
        <div>
          <span className="text-slate-500">Masthöhe: </span>
          <span className="text-slate-200 font-semibold">{pendingPrefill.mastHeight} m</span>
        </div>
        {pendingPrefill.levels.map((lvl, i) => (
          <div key={lvl.segment}>
            <span className="text-slate-500">Ebene {i + 1}: </span>
            <span className="text-slate-200">{lvl.height} m</span>
            <span className="text-slate-500 text-xs"> (Seg. {lvl.segment})</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setPendingPrefill(null)}
          className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
        >
          {t('spiderBeamConfirmCancel')}
        </button>
        <button
          onClick={() => {
            setConfirmedPrefill(pendingPrefill)
            setActiveCalc('guywire')
            setPendingPrefill(null)
          }}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-600 rounded-md transition-colors"
        >
          {t('spiderBeamConfirmYes')}
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 7: Run all tests**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run test
```

Expected: All tests PASS.

- [ ] **Step 8: Run lint**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 9: Manual smoke test with dev server**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run dev
```

Verify in browser (http://localhost:5173):
- [ ] "Spider Beam" entry appears in sidebar
- [ ] Clicking it shows the mast diagram + results panel
- [ ] Diagram shows 14m mast with Grundrohr (blue) + active trapezoid + 3 yellow attachment points
- [ ] Changing height to 12 → label shows "Seg. 2–3 im Grundrohr", heights become 7/9/11 m
- [ ] Clicking an attachment point toggles it (yellow ↔ grey in diagram, checked ↔ unchecked in panel)
- [ ] Transfer box updates immediately when toggling
- [ ] "Abspannungs-Rechner öffnen" opens the confirmation dialog
- [ ] "Abbrechen" closes dialog, guy wire calc unchanged
- [ ] "Ja, überschreiben" navigates to guy wire calc with correct prefilled heights + mastHeight
- [ ] Language toggle (DE/EN) translates all Spider Beam labels

- [ ] **Step 10: Commit**

```bash
git add src/App.jsx src/components/Sidebar.jsx
git commit -m "feat(spiderbeam): wire calculator into App with confirmation dialog"
```

---

## Task 8: Build Verification

- [ ] **Step 1: Full test run**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run test
```

Expected: All tests PASS including `spiderbeam.test.js`.

- [ ] **Step 2: Production build**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run build
```

Expected: Build succeeds, no errors.

- [ ] **Step 3: Standalone build**

```bash
cd "d:/!GitHub/Amateur Radio Tower Designer" && npm run build:standalone
```

Expected: Build succeeds, no errors.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "build: verify Spider Beam Mast-Konfigurator in production builds"
```
