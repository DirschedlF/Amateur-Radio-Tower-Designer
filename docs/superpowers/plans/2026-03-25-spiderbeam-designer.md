# Spider Beam Mast-Konfigurator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Spider Beam Mast-Konfigurator" calculator that lets users configure a Spiderbeam 14m HD telescoping mast, select guy wire attachment points by clicking, and transfer the configuration to the existing Guy Wire calculator.

**Architecture:** Standalone calculator following the established pattern (pure-JS logic + Calc.jsx orchestrator + child components). Two new App.jsx states (`pendingPrefill` / `confirmedPrefill`) decouple the transfer dialog from the actual GuyWireCalc update, preventing silent overwrites on cancel. GuyWireCalc gains a `prefill` prop that fires once on change.

**Tech Stack:** React 18, Vite 7, Tailwind CSS 3, Vitest

**Spec:** `docs/superpowers/specs/2026-03-25-spiderbeam-designer-design.md`

---

## File Map

| Action | File | Responsibility |
| ------ | ---- | -------------- |
| Create | `src/calculators/spiderbeam/spiderbeam.js` | Pure mast calculation logic, mast configs |
| Create | `src/calculators/spiderbeam/SpiderBeamCalc.jsx` | Orchestrator, owns state |
| Create | `src/calculators/spiderbeam/SpiderBeamDiagram.jsx` | SVG mast diagram |
| Create | `src/calculators/spiderbeam/SpiderBeamResults.jsx` | Attachment point controls + transfer box |
| Create | `tests/spiderbeam.test.js` | Unit tests for spiderbeam.js |
| Modify | `src/i18n/translations.js` | 12 new i18n keys |
| Modify | `src/components/Sidebar.jsx` | Add spiderbeam entry to CALCULATORS |
| Modify | `src/calculators/guywire/GuyWireCalc.jsx` | Add `prefill` prop + useEffect |
| Modify | `src/App.jsx` | Wire SpiderBeamCalc, add pendingPrefill/confirmedPrefill, add confirm dialog |

---

## Task 1: i18n Keys

**Files:**
- Modify: `src/i18n/translations.js`

Add the new keys to both `de` and `en` objects. The `de` block ends at line 123 (closing brace of `de`); add before it. The `en` block ends at line 245; add before it.

- [ ] **Step 1.1: Add DE keys to `translations.js`**

In `src/i18n/translations.js`, find the comment `// Header` in the `de` block (line ~118) and insert before it:

```js
    // Spider Beam Mast-Konfigurator
    calcSpiderBeam: 'Spider Beam',
    calcSpiderBeamSubtitle: 'Mast-Konfigurator',
    spiderBeamMastLabel: 'Masttyp',
    spiderBeamHeight: 'Masthöhe',
    spiderBeamSegmentsActive: 'Segmente ausgezogen',
    spiderBeamInGroundtube: 'im Grundrohr',
    spiderBeamGuyLevels: 'Abspannpunkte',
    spiderBeamLevelActive: 'aktiv',
    spiderBeamLevelInactive: 'nicht ausgezogen',
    spiderBeamTransferTitle: 'Übergabe an Abspannungs-Rechner',
    spiderBeamOpenGuyWire: 'Abspannungs-Rechner öffnen →',
    spiderBeamConfirmTitle: 'Abspannrechner überschreiben?',
    spiderBeamConfirmBody: 'Aktuelle Werte im Abspannrechner werden ersetzt:',
    spiderBeamConfirmYes: 'Ja, überschreiben',
    spiderBeamConfirmCancel: 'Abbrechen',
```

- [ ] **Step 1.2: Add EN keys to `translations.js`**

Find the comment `// Header` in the `en` block and insert before it:

```js
    // Spider Beam Mast-Konfigurator
    calcSpiderBeam: 'Spider Beam',
    calcSpiderBeamSubtitle: 'Mast Designer',
    spiderBeamMastLabel: 'Mast type',
    spiderBeamHeight: 'Mast height',
    spiderBeamSegmentsActive: 'Segments extended',
    spiderBeamInGroundtube: 'in base tube',
    spiderBeamGuyLevels: 'Guy wire levels',
    spiderBeamLevelActive: 'active',
    spiderBeamLevelInactive: 'not extended',
    spiderBeamTransferTitle: 'Transfer to Guy Wire Calc',
    spiderBeamOpenGuyWire: 'Open Guy Wire Calc →',
    spiderBeamConfirmTitle: 'Overwrite guy wire calc?',
    spiderBeamConfirmBody: 'Current values in the guy wire calc will be replaced:',
    spiderBeamConfirmYes: 'Yes, overwrite',
    spiderBeamConfirmCancel: 'Cancel',
```

- [ ] **Step 1.3: Verify lint passes**

```bash
npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 1.4: Commit**

```bash
git add src/i18n/translations.js
git commit -m "feat(i18n): add Spider Beam Mast-Konfigurator translation keys"
```

---

## Task 2: Pure Calculation Logic (TDD)

**Files:**
- Create: `tests/spiderbeam.test.js`
- Create: `src/calculators/spiderbeam/spiderbeam.js`

### Physics recap

- 14 segments, each 1.0 m. Segment 1 = Grundrohr (base, always present).
- For height H: active segments are those with `N ≥ 16 − H` (where N > 1).
- Segments in Grundrohr: N ∈ {2 … 15−H}.
- Height of attachment point at segment N = `H + N − 15` (only valid when active).
- Segment N is available as an attachment point when `H ≥ 16 − N`.

- [ ] **Step 2.1: Write the failing tests**

Create `tests/spiderbeam.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { MAST_CONFIGS, calculateSpiderBeam } from '../src/calculators/spiderbeam/spiderbeam.js'

const config14 = MAST_CONFIGS['14m_hd']

describe('MAST_CONFIGS', () => {
  it('exports 14m_hd config with 14 segments', () => {
    expect(config14.segments).toBe(14)
    expect(config14.segmentLength).toBe(1.0)
    expect(config14.guyLevels).toEqual([10, 12, 14])
  })
})

describe('calculateSpiderBeam — full height H=14', () => {
  const r = calculateSpiderBeam({ mastConfig: config14, desiredHeight: 14, activeGuyLevels: [10, 12, 14] })

  it('all segments 2–14 are active', () => {
    expect(r.activeSegments).toEqual([2,3,4,5,6,7,8,9,10,11,12,13,14])
  })

  it('no segments in Grundrohr', () => {
    expect(r.inGroundtube).toEqual([])
  })

  it('attachment point seg 10 at 9 m', () => {
    const p = r.attachmentPoints.find(p => p.segment === 10)
    expect(p.height).toBe(9)
    expect(p.available).toBe(true)
    expect(p.active).toBe(true)
  })

  it('attachment point seg 12 at 11 m', () => {
    const p = r.attachmentPoints.find(p => p.segment === 12)
    expect(p.height).toBe(11)
  })

  it('attachment point seg 14 at 13 m', () => {
    const p = r.attachmentPoints.find(p => p.segment === 14)
    expect(p.height).toBe(13)
  })
})

describe('calculateSpiderBeam — H=12', () => {
  const r = calculateSpiderBeam({ mastConfig: config14, desiredHeight: 12, activeGuyLevels: [10, 12] })

  it('segments 4–14 active', () => {
    expect(r.activeSegments).toEqual([4,5,6,7,8,9,10,11,12,13,14])
  })

  it('segments 2 and 3 in Grundrohr', () => {
    expect(r.inGroundtube).toEqual([2, 3])
  })

  it('seg 10 at 7 m', () => {
    expect(r.attachmentPoints.find(p => p.segment === 10).height).toBe(7)
  })

  it('seg 12 at 9 m', () => {
    expect(r.attachmentPoints.find(p => p.segment === 12).height).toBe(9)
  })

  it('seg 14 at 11 m but not selected', () => {
    const p = r.attachmentPoints.find(p => p.segment === 14)
    expect(p.height).toBe(11)
    expect(p.available).toBe(true)
    expect(p.active).toBe(false)
  })
})

describe('calculateSpiderBeam — H=10', () => {
  const r = calculateSpiderBeam({ mastConfig: config14, desiredHeight: 10, activeGuyLevels: [10, 12, 14] })

  it('segments 6–14 active', () => {
    expect(r.activeSegments).toEqual([6,7,8,9,10,11,12,13,14])
  })

  it('segments 2–5 in Grundrohr', () => {
    expect(r.inGroundtube).toEqual([2,3,4,5])
  })

  it('seg 10 at 5 m', () => {
    expect(r.attachmentPoints.find(p => p.segment === 10).height).toBe(5)
  })
})

describe('calculateSpiderBeam — boundary cases', () => {
  it('H=6: seg 10 is available (exactly at boundary)', () => {
    const r = calculateSpiderBeam({ mastConfig: config14, desiredHeight: 6, activeGuyLevels: [10] })
    const p = r.attachmentPoints.find(p => p.segment === 10)
    expect(p.available).toBe(true)
    expect(p.height).toBe(1)
  })

  it('H=5: seg 10 is not available', () => {
    const r = calculateSpiderBeam({ mastConfig: config14, desiredHeight: 5, activeGuyLevels: [10] })
    const p = r.attachmentPoints.find(p => p.segment === 10)
    expect(p.available).toBe(false)
    expect(p.active).toBe(false)
  })

  it('H=4: seg 12 available, seg 10 not', () => {
    const r = calculateSpiderBeam({ mastConfig: config14, desiredHeight: 4, activeGuyLevels: [10, 12] })
    expect(r.attachmentPoints.find(p => p.segment === 12).available).toBe(true)
    expect(r.attachmentPoints.find(p => p.segment === 10).available).toBe(false)
  })

  it('H=1: no segments active, no attachment points available', () => {
    const r = calculateSpiderBeam({ mastConfig: config14, desiredHeight: 1, activeGuyLevels: [] })
    expect(r.activeSegments).toEqual([])
    expect(r.attachmentPoints.every(p => !p.available)).toBe(true)
  })
})
```

- [ ] **Step 2.2: Run tests — verify they fail**

```bash
npm run test -- tests/spiderbeam.test.js
```

Expected: FAIL — `Cannot find module '../src/calculators/spiderbeam/spiderbeam.js'`

- [ ] **Step 2.3: Create `src/calculators/spiderbeam/spiderbeam.js`**

```js
export const MAST_CONFIGS = {
  '14m_hd': {
    name: 'Spiderbeam 14m HD',
    segments: 14,
    segmentLength: 1.0,
    guyLevels: [10, 12, 14],
  },
}

/**
 * @param {{ mastConfig: object, desiredHeight: number, activeGuyLevels: number[] }}
 * @returns {{ activeSegments: number[], inGroundtube: number[], attachmentPoints: object[] }}
 */
export function calculateSpiderBeam({ mastConfig, desiredHeight, activeGuyLevels }) {
  const H = desiredHeight
  const { segments, guyLevels } = mastConfig

  // Segments 2..segments that are pulled out: N >= 16 - H
  const firstActive = 16 - H
  const activeSegments = []
  const inGroundtube = []

  for (let n = 2; n <= segments; n++) {
    if (n >= firstActive) activeSegments.push(n)
    else inGroundtube.push(n)
  }

  // Attachment points
  const attachmentPoints = guyLevels.map(n => {
    const available = n >= firstActive
    const height = available ? H + n - 15 : null
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

- [ ] **Step 2.4: Run tests — verify they pass**

```bash
npm run test -- tests/spiderbeam.test.js
```

Expected: all tests PASS

- [ ] **Step 2.5: Commit**

```bash
git add src/calculators/spiderbeam/spiderbeam.js tests/spiderbeam.test.js
git commit -m "feat(spiderbeam): add pure calculation logic with unit tests"
```

---

## Task 3: SpiderBeamDiagram.jsx

**Files:**
- Create: `src/calculators/spiderbeam/SpiderBeamDiagram.jsx`

Renders an SVG mast cross-section. Follows the pattern of `GuyWireDiagram.jsx`.

- [ ] **Step 3.1: Create `src/calculators/spiderbeam/SpiderBeamDiagram.jsx`**

```jsx
import { useLanguage } from '../../hooks/useLanguage.jsx'

const SVG_W       = 220
const SVG_H       = 360
const MAST_X      = 110      // horizontal center of mast
const GROUND_Y    = 335
const TOP_MARGIN  = 22
const WIRE_OFFSET = 60       // symbolic horizontal offset for guy wire lines (not to scale)

// Mast half-widths in px (linear interpolation between bottom and top of active section)
const HALF_W_BOTTOM = 22
const HALF_W_TOP    = 4
const GRUNDROHR_HALF_W = 28

export default function SpiderBeamDiagram({ results }) {
  const { t } = useLanguage()
  if (!results) return null

  const { desiredHeight, activeSegments, inGroundtube, attachmentPoints } = results
  const availH = GROUND_Y - TOP_MARGIN
  const scale  = availH / desiredHeight   // px per metre

  // Grundrohr block: always 1 m tall, sits at the base
  const groundtubeH = 1 * scale
  const groundtubeTop = GROUND_Y - groundtubeH

  // Active mast trapezoid: from 1 m up to desiredHeight m
  const mastTopY   = GROUND_Y - desiredHeight * scale
  const mastBaseY  = groundtubeTop

  function halfWidthAt(heightM) {
    // Interpolate between bottom (1 m) and top (desiredHeight m)
    const frac = (heightM - 1) / Math.max(desiredHeight - 1, 1)
    return HALF_W_BOTTOM + (HALF_W_TOP - HALF_W_BOTTOM) * frac
  }

  const hasActiveMast = activeSegments.length > 0

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
        {t('diagramTitle')}
      </p>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: 380 }}>

        {/* Ground line */}
        <line x1="0" y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke="#334155" strokeWidth="2" />
        <text x={MAST_X} y={GROUND_Y + 13} fill="#475569" fontSize="9" textAnchor="middle">
          {t('ground')} · 0 m
        </text>

        {/* Grundrohr (Seg. 1) — blue filled rect */}
        <rect
          x={MAST_X - GRUNDROHR_HALF_W} y={groundtubeTop}
          width={GRUNDROHR_HALF_W * 2} height={groundtubeH}
          fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" rx="2"
        />
        <text x={MAST_X} y={groundtubeTop + groundtubeH / 2 + 3}
          fill="#93c5fd" fontSize="8" textAnchor="middle" fontWeight="600">
          Seg. 1
        </text>

        {/* Eingezogene Segmente annotation (if any) */}
        {inGroundtube.length > 0 && (
          <>
            <rect
              x={MAST_X - GRUNDROHR_HALF_W + 4} y={groundtubeTop + 2}
              width={GRUNDROHR_HALF_W * 2 - 8} height={groundtubeH - 4}
              fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3,2" rx="1"
            />
            <text x={MAST_X + GRUNDROHR_HALF_W + 6} y={groundtubeTop + groundtubeH / 2 + 3}
              fill="#475569" fontSize="8">
              {`Seg. ${inGroundtube[0]}${inGroundtube.length > 1 ? `–${inGroundtube[inGroundtube.length - 1]}` : ''}`}
            </text>
            <text x={MAST_X + GRUNDROHR_HALF_W + 6} y={groundtubeTop + groundtubeH / 2 + 12}
              fill="#475569" fontSize="8">
              {t('spiderBeamInGroundtube')}
            </text>
          </>
        )}

        {/* Active mast trapezoid */}
        {hasActiveMast && (
          <polygon
            points={[
              `${MAST_X - HALF_W_BOTTOM},${mastBaseY}`,
              `${MAST_X + HALF_W_BOTTOM},${mastBaseY}`,
              `${MAST_X + HALF_W_TOP},${mastTopY}`,
              `${MAST_X - HALF_W_TOP},${mastTopY}`,
            ].join(' ')}
            fill="#334155" stroke="#60a5fa" strokeWidth="1.5"
          />
        )}

        {/* Mast top label */}
        {hasActiveMast && (
          <text x={MAST_X} y={mastTopY - 5} fill="#94a3b8" fontSize="9" textAnchor="middle">
            ▲ {desiredHeight} m
          </text>
        )}

        {/* Attachment points */}
        {attachmentPoints.map(ap => {
          if (!ap.available) return null
          const y    = GROUND_Y - ap.height * scale
          const hw   = halfWidthAt(ap.height)
          const color = ap.active ? '#f59e0b' : '#475569'
          const dash  = ap.active ? undefined : '3,2'

          return (
            <g key={ap.segment}>
              {/* Horizontal attachment line */}
              <line
                x1={MAST_X - hw - 8} y1={y}
                x2={MAST_X + hw + 8} y2={y}
                stroke={color} strokeWidth={ap.active ? 2 : 1.5}
                strokeDasharray={dash}
              />
              {/* Dot on mast */}
              <circle
                cx={MAST_X} cy={y} r={4}
                fill={ap.active ? color : '#1e293b'}
                stroke={color} strokeWidth={1.5}
              />
              {/* Symbolic guy wire lines (active only) */}
              {ap.active && (
                <>
                  <line
                    x1={MAST_X} y1={y}
                    x2={MAST_X - WIRE_OFFSET} y2={GROUND_Y}
                    stroke={color} strokeWidth="1" strokeDasharray="5,3" opacity="0.6"
                  />
                  <line
                    x1={MAST_X} y1={y}
                    x2={MAST_X + WIRE_OFFSET} y2={GROUND_Y}
                    stroke={color} strokeWidth="1" strokeDasharray="5,3" opacity="0.6"
                  />
                </>
              )}
              {/* Height label left */}
              <text x={MAST_X - hw - 16} y={y + 3}
                fill={color} fontSize="8" textAnchor="end">
                {ap.height} m
              </text>
              {/* Segment label right */}
              <text x={MAST_X + hw + 12} y={y + 3}
                fill={color} fontSize="8">
                {`Seg. ${ap.segment}`}
              </text>
            </g>
          )
        })}

      </svg>
    </div>
  )
}
```

- [ ] **Step 3.2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3.3: Commit**

```bash
git add src/calculators/spiderbeam/SpiderBeamDiagram.jsx
git commit -m "feat(spiderbeam): add SVG mast diagram component"
```

---

## Task 4: SpiderBeamResults.jsx

**Files:**
- Create: `src/calculators/spiderbeam/SpiderBeamResults.jsx`

Right-side panel: static mast type label, height input, clickable attachment point rows, and the transfer box.

- [ ] **Step 4.1: Create `src/calculators/spiderbeam/SpiderBeamResults.jsx`**

```jsx
import { useLanguage } from '../../hooks/useLanguage.jsx'

export default function SpiderBeamResults({
  results,
  mastConfig,
  desiredHeight,
  activeGuyLevels,
  onToggleLevel,
  onConfigureGuyWire,
  onNavigateToGuyWire,
  onHeightChange,
}) {
  const { t } = useLanguage()
  if (!results) return null

  const { attachmentPoints } = results
  const selectedPoints = attachmentPoints.filter(p => p.active)

  function handleTransfer() {
    onConfigureGuyWire({
      mastHeight: desiredHeight,
      levels: selectedPoints.map(p => ({ segment: p.segment, height: p.height })),
    })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Mast type label + height input */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-slate-500">
            {t('spiderBeamMastLabel')}
          </span>
          <span className="text-sm font-semibold text-slate-200">{mastConfig.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400">{t('spiderBeamHeight')}</label>
          <input
            type="number"
            min={1}
            max={mastConfig.segments}
            value={desiredHeight}
            onChange={e => onHeightChange(Math.min(mastConfig.segments, Math.max(1, Number(e.target.value))))}
            className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 text-center"
          />
          <span className="text-sm text-slate-400">m</span>
          <span className="text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/40 rounded px-2 py-0.5">
            {t('spiderBeamSegmentsActive')}: {results.activeSegments.length}
            {results.inGroundtube.length > 0 && (
              <> · {results.inGroundtube.length} {t('spiderBeamInGroundtube')}</>
            )}
          </span>
        </div>
      </div>

      {/* Attachment points */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
          {t('spiderBeamGuyLevels')}
        </p>

        <div className="flex flex-col gap-2">
          {attachmentPoints.map(ap => {
            const isActive = ap.active
            return (
              <button
                key={ap.segment}
                onClick={() => ap.available && onToggleLevel(ap.segment)}
                disabled={!ap.available}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                  !ap.available
                    ? 'opacity-40 cursor-not-allowed bg-slate-800/50 border border-slate-700'
                    : isActive
                    ? 'bg-amber-900/20 border border-amber-700/50 hover:bg-amber-900/30'
                    : 'bg-slate-700/40 border border-slate-600 hover:bg-slate-700'
                }`}
              >
                {/* Checkbox indicator */}
                <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${
                  isActive ? 'bg-amber-500' : 'border-2 border-slate-500'
                }`}>
                  {isActive && <span className="text-black text-xs font-bold">✓</span>}
                </div>

                <div className="flex-1">
                  <div className={`text-sm font-medium ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                    Segment {ap.segment}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                    {ap.available
                      ? `${t('spiderBeamHeight')}: ${ap.height} m`
                      : t('spiderBeamLevelInactive')}
                  </div>
                </div>

                <span className={`text-xs px-2 py-0.5 rounded ${
                  !ap.available
                    ? 'text-slate-500'
                    : isActive
                    ? 'text-emerald-400 bg-emerald-900/30'
                    : 'text-slate-500'
                }`}>
                  {ap.available ? (isActive ? t('spiderBeamLevelActive') : '—') : '—'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Transfer box */}
      <div className="bg-indigo-950/40 border border-indigo-700/40 rounded-lg p-4">
        <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">
          {t('spiderBeamTransferTitle')}
        </p>

        {selectedPoints.length === 0 ? (
          <p className="text-sm text-slate-500 mb-3">—</p>
        ) : (
          <div className="text-sm text-slate-300 mb-3 space-y-1">
            <div>
              <span className="text-indigo-400">{t('spiderBeamHeight')}: </span>
              <span className="font-semibold">{desiredHeight} m</span>
            </div>
            {selectedPoints.map((p, i) => (
              <div key={p.segment}>
                <span className="text-indigo-400">Ebene {i + 1}: </span>
                <span className="font-semibold">{p.height} m</span>
                <span className="text-slate-500 text-xs ml-1">(Seg. {p.segment})</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleTransfer}
          disabled={selectedPoints.length === 0}
          className={`w-full rounded-md py-2 text-sm font-semibold transition-colors ${
            selectedPoints.length === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {t('spiderBeamOpenGuyWire')}
        </button>
      </div>

    </div>
  )
}
```

- [ ] **Step 4.2: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4.3: Commit**

```bash
git add src/calculators/spiderbeam/SpiderBeamResults.jsx
git commit -m "feat(spiderbeam): add attachment point controls and transfer box"
```

---

## Task 5: SpiderBeamCalc.jsx

**Files:**
- Create: `src/calculators/spiderbeam/SpiderBeamCalc.jsx`

Orchestrator: holds state, calls `calculateSpiderBeam` via `useMemo`, wires Diagram + Results together.

- [ ] **Step 5.1: Create `src/calculators/spiderbeam/SpiderBeamCalc.jsx`**

```jsx
import { useState, useMemo } from 'react'
import { MAST_CONFIGS, calculateSpiderBeam } from './spiderbeam.js'
import SpiderBeamDiagram from './SpiderBeamDiagram.jsx'
import SpiderBeamResults from './SpiderBeamResults.jsx'
import { useLanguage } from '../../hooks/useLanguage.jsx'

const mastConfig = MAST_CONFIGS['14m_hd']

export default function SpiderBeamCalc({
  onConfigureGuyWire = () => {},
  onNavigateToGuyWire = () => {},
}) {
  const { t } = useLanguage()
  const [desiredHeight, setDesiredHeight] = useState(14)
  const [activeGuyLevels, setActiveGuyLevels] = useState([10, 12, 14])

  const results = useMemo(() => {
    try {
      return { ...calculateSpiderBeam({ mastConfig, desiredHeight, activeGuyLevels }), desiredHeight }
    } catch {
      return null
    }
  }, [desiredHeight, activeGuyLevels])

  function handleToggleLevel(segment) {
    setActiveGuyLevels(prev =>
      prev.includes(segment) ? prev.filter(s => s !== segment) : [...prev, segment]
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SpiderBeamDiagram results={results} />
        <SpiderBeamResults
          results={results}
          mastConfig={mastConfig}
          desiredHeight={desiredHeight}
          activeGuyLevels={activeGuyLevels}
          onHeightChange={setDesiredHeight}
          onToggleLevel={handleToggleLevel}
          onConfigureGuyWire={onConfigureGuyWire}
          onNavigateToGuyWire={onNavigateToGuyWire}
        />
      </div>

      <p className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/40 rounded-lg px-4 py-3 leading-relaxed">
        ⚠️ {t('windLoadDisclaimer')}
      </p>
    </div>
  )
}
```

- [ ] **Step 5.2: Run full test suite**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 5.3: Verify lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 5.4: Commit**

```bash
git add src/calculators/spiderbeam/SpiderBeamCalc.jsx
git commit -m "feat(spiderbeam): add orchestrator component"
```

---

## Task 6: Sidebar — Add Entry

**Files:**
- Modify: `src/components/Sidebar.jsx`

Add the `spiderbeam` entry as the first item in the `CALCULATORS` array (so it appears at the top).

- [ ] **Step 6.1: Edit `src/components/Sidebar.jsx`**

Replace:

```js
const CALCULATORS = [
  { id: 'guywire', labelKey: 'calcGuyWire', subtitleKey: 'calcGuyWireSubtitle', active: true },
  { id: 'windload', labelKey: 'calcWindLoad', subtitleKey: 'calcWindLoadSubtitle', active: true },
]
```

With:

```js
const CALCULATORS = [
  { id: 'spiderbeam', labelKey: 'calcSpiderBeam', subtitleKey: 'calcSpiderBeamSubtitle', active: true },
  { id: 'guywire', labelKey: 'calcGuyWire', subtitleKey: 'calcGuyWireSubtitle', active: true },
  { id: 'windload', labelKey: 'calcWindLoad', subtitleKey: 'calcWindLoadSubtitle', active: true },
]
```

- [ ] **Step 6.2: Verify lint**

```bash
npm run lint
```

- [ ] **Step 6.3: Commit**

```bash
git add src/components/Sidebar.jsx
git commit -m "feat(sidebar): add Spider Beam Mast-Konfigurator entry"
```

---

## Task 7: GuyWireCalc — Prefill Prop

**Files:**
- Modify: `src/calculators/guywire/GuyWireCalc.jsx`

Add a `prefill` prop. When it changes to a non-null value, overwrite the internal config (mastHeight + level heights) and sync `sharedMastHeight`.

- [ ] **Step 7.1: Edit `src/calculators/guywire/GuyWireCalc.jsx`**

Change the function signature (line 20) from:

```js
export default function GuyWireCalc({ windLoadSnapshot = null, onNavigateToWindLoad = () => {}, mastHeight = null, onMastHeightChange = () => {}, onGuyWireChange = () => {} }) {
```

To:

```js
export default function GuyWireCalc({ windLoadSnapshot = null, onNavigateToWindLoad = () => {}, mastHeight = null, onMastHeightChange = () => {}, onGuyWireChange = () => {}, prefill = null }) {
```

After the existing `useEffect([mastHeight])` block (after line 27), add:

```js
  useEffect(() => {
    if (!prefill) return
    setConfig(c => ({
      ...c,
      mastHeight: prefill.mastHeight,
      levels: prefill.levels.length,
      // Preserve all 3 levelConfig slots — only overwrite the first n entries
      levelConfig: c.levelConfig.map((existing, i) =>
        i < prefill.levels.length
          ? { ...existing, height: prefill.levels[i].height }
          : existing
      ),
    }))
    onMastHeightChange(prefill.mastHeight)
  }, [prefill]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 7.2: Run full test suite**

```bash
npm run test
```

Expected: all tests pass (existing GuyWire tests still green).

- [ ] **Step 7.3: Verify lint**

```bash
npm run lint
```

- [ ] **Step 7.4: Commit**

```bash
git add src/calculators/guywire/GuyWireCalc.jsx
git commit -m "feat(guywire): add prefill prop for Spider Beam transfer"
```

---

## Task 8: App.jsx — Wire Everything Together

**Files:**
- Modify: `src/App.jsx`

Add `SpiderBeamCalc` to the render tree, two new states for the transfer dialog, and the inline confirmation modal.

- [ ] **Step 8.1: Add import to `src/App.jsx`**

After the existing imports at the top of `App.jsx`, add:

```js
import SpiderBeamCalc from './calculators/spiderbeam/SpiderBeamCalc.jsx'
```

- [ ] **Step 8.2: Add two new states**

After `const [drawerOpen, setDrawerOpen] = useState(false)` (line 13), add:

```js
  const [pendingPrefill, setPendingPrefill] = useState(null)
  const [confirmedPrefill, setConfirmedPrefill] = useState(null)
```

- [ ] **Step 8.3: Add `prefill` prop to GuyWireCalc render**

Find the existing `<GuyWireCalc` block and add `prefill={confirmedPrefill}`:

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

- [ ] **Step 8.4: Add SpiderBeamCalc render block**

After the WindLoadCalc `</div>` block and before the closing `</main>` footer, add:

```jsx
          <div className={activeCalc === 'spiderbeam' ? '' : 'hidden'}>
            <SpiderBeamCalc
              onConfigureGuyWire={setPendingPrefill}
              onNavigateToGuyWire={() => setActiveCalc('guywire')}
            />
          </div>
```

- [ ] **Step 8.5: Add confirmation dialog**

Inside the `{/* Body */}` div, after the overlay backdrop div (after the `drawerOpen && <div … />` block), add:

```jsx
        {/* Spider Beam → Guy Wire transfer confirmation dialog */}
        {pendingPrefill && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-sm w-full shadow-2xl">
              <h2 className="text-base font-semibold text-slate-100 mb-1">
                {t('spiderBeamConfirmTitle')}
              </h2>
              <p className="text-sm text-slate-400 mb-3">{t('spiderBeamConfirmBody')}</p>
              <div className="text-sm text-slate-200 mb-4 space-y-1">
                <div>
                  <span className="text-slate-400">{t('spiderBeamHeight')}: </span>
                  <span className="font-semibold">{pendingPrefill.mastHeight} m</span>
                </div>
                {pendingPrefill.levels.map((lvl, i) => (
                  <div key={lvl.segment}>
                    <span className="text-slate-400">Ebene {i + 1}: </span>
                    <span className="font-semibold">{lvl.height} m</span>
                    <span className="text-slate-500 text-xs ml-1">(Seg. {lvl.segment})</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setPendingPrefill(null)}
                  className="px-4 py-2 rounded-md text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  {t('spiderBeamConfirmCancel')}
                </button>
                <button
                  onClick={() => {
                    setConfirmedPrefill(pendingPrefill)
                    setActiveCalc('guywire')
                    setPendingPrefill(null)
                  }}
                  className="px-4 py-2 rounded-md text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors font-semibold"
                >
                  {t('spiderBeamConfirmYes')}
                </button>
              </div>
            </div>
          </div>
        )}
```

- [ ] **Step 8.6: Run full test suite**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 8.7: Verify lint**

```bash
npm run lint
```

Expected: no errors, no warnings.

- [ ] **Step 8.8: Start dev server and do a manual smoke test**

```bash
npm run dev
```

Open `http://localhost:5173`. Check:

1. "Spider Beam" appears as first item in sidebar
2. Click Spider Beam → Mast-Konfigurator renders with diagram and controls
3. Change height to 12 → diagram updates, status badge shows "Segmente ausgezogen: 11 · 2 im Grundrohr"
4. Click "Seg. 14" attachment point to toggle it off → dot turns gray in diagram
5. Click "Abspannungs-Rechner öffnen" → confirmation dialog appears with correct heights
6. Click "Abbrechen" → dialog closes, stay on Spider Beam, Guy Wire calc NOT changed
7. Click button again → dialog appears → click "Ja, überschreiben" → navigates to Abspannung, heights pre-filled
8. Switch DE/EN via language toggle → all Spider Beam labels switch language

- [ ] **Step 8.9: Commit**

```bash
git add src/App.jsx
git commit -m "feat(app): integrate Spider Beam Mast-Konfigurator with prefill dialog"
```

---

## Task 9: .gitignore — Exclude Brainstorm Files

**Files:**
- Modify: `.gitignore`

- [ ] **Step 9.1: Add `.superpowers/` to `.gitignore`**

Check if `.gitignore` already excludes `.superpowers/`:

```bash
grep -n superpowers .gitignore
```

If not present, add to `.gitignore`:

```
# Brainstorming session files
.superpowers/
```

- [ ] **Step 9.2: Commit**

```bash
git add .gitignore
git commit -m "chore: exclude .superpowers/ brainstorm files from git"
```

---

## Completion Checklist

- [ ] All 7 Vitest test files pass (`npm run test`)
- [ ] ESLint strict passes (`npm run lint` — 0 warnings, 0 errors)
- [ ] Dev server smoke test (Task 8.8) all 8 checks pass
- [ ] Standalone build works: `npm run build:standalone` completes without error
