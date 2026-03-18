# Guy-Wire Load Calculation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a wire tension calculator to the Guy Wire Calculator that reads wind load results and computes per-level wire tension using the sectional method.

**Architecture:** App.jsx holds a `windLoadSnapshot` state; WindLoadCalc writes to it via a prop callback; GuyWireCalc reads from it and renders a new GuyWireLoad child component. All physics live in a new pure function `guywireload.js`, tested independently.

**Tech Stack:** React 18, Vite 7, Tailwind CSS 3, Vitest. Custom i18n in `src/i18n/translations.js`. Existing pattern: pure `.js` + `Calc.jsx` orchestrator + child components.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/calculators/guywire/guywire.js` | Modify | Add `height` and `radius` to each level result object |
| `src/calculators/guywire/guywireload.js` | Create | Pure function `calculateGuyWireLoad` — sectional method physics |
| `src/calculators/guywire/GuyWireLoad.jsx` | Create | UI component — empty state + results table |
| `src/calculators/guywire/GuyWireCalc.jsx` | Modify | Accept `windLoadSnapshot` + `onNavigateToWindLoad` props, render `<GuyWireLoad>` |
| `src/calculators/windload/WindLoadCalc.jsx` | Modify | Accept `onWindLoadChange` prop, emit snapshot via useEffect |
| `src/App.jsx` | Modify | Add `windLoadSnapshot` state, replace generic render with per-key render |
| `src/i18n/translations.js` | Modify | Add 7 new DE/EN keys |
| `tests/guywire.test.js` | Modify | Add assertions for new `height`/`radius` fields |
| `tests/guywireload.test.js` | Create | Full unit test suite for `calculateGuyWireLoad` |

---

## Task 1: Extend `guywire.js` output — add `height` and `radius`

**Files:**
- Modify: `src/calculators/guywire/guywire.js`
- Test: `tests/guywire.test.js`

- [ ] **Step 1: Add failing assertions to existing test file**

  Open `tests/guywire.test.js` and add this new test at the end of the `describe` block (before the closing `}`):

  ```js
  it('exposes height and radius in each level result', () => {
    const result = calculateGuyWires(baseConfig)
    expect(result.levels[0].height).toBe(6)
    expect(result.levels[0].radius).toBe(5)
    expect(result.levels[1].height).toBe(11)
    expect(result.levels[1].radius).toBe(8)
  })
  ```

- [ ] **Step 2: Run tests to confirm new test fails**

  ```bash
  npm run test -- --reporter=verbose
  ```

  Expected: all existing tests pass, new test fails with `expected undefined to be 6`.

- [ ] **Step 3: Update `guywire.js` to include `height` and `radius`**

  In `src/calculators/guywire/guywire.js`, change the `return` inside the `.map()` callback (around line 21) from:

  ```js
  return {
    wireLength,
    angleFromHorizontal,
    angleFromMast,
    totalLengthPerLevel,
    wires,
  }
  ```

  to:

  ```js
  return {
    height,
    radius,
    wireLength,
    angleFromHorizontal,
    angleFromMast,
    totalLengthPerLevel,
    wires,
  }
  ```

- [ ] **Step 4: Run tests — all must pass**

  ```bash
  npm run test -- --reporter=verbose
  ```

  Expected: all tests pass including the new one.

- [ ] **Step 5: Commit**

  ```bash
  git add src/calculators/guywire/guywire.js tests/guywire.test.js
  git commit -m "feat(guywire): expose height and radius in level results"
  ```

---

## Task 2: Add i18n keys for the load section

**Files:**
- Modify: `src/i18n/translations.js`

- [ ] **Step 1: Add DE keys**

  In `src/i18n/translations.js`, add the following keys to the `de` object, after the `windLoadDisclaimer` line:

  ```js
  // Guy Wire Load section
  loadSectionTitle: 'Belastungsberechnung',
  loadRequiredHint: 'Bitte zuerst den Windlast-Rechner ausfüllen, um die Drahtspannungen zu berechnen.',
  loadGoToWindLoad: '→ Windlast-Rechner',
  colSectionForce: 'Abschnittskraft',
  colHorizPerWire: 'Horiz. je Draht',
  colTension: 'Drahtspannung',
  loadDisclaimer: 'Planungsschätzung — keine statische Auslegung. Vorspannkraft nicht berücksichtigt.',
  ```

- [ ] **Step 2: Add EN keys**

  Add the following keys to the `en` object, after the `windLoadDisclaimer` line:

  ```js
  // Guy Wire Load section
  loadSectionTitle: 'Load Analysis',
  loadRequiredHint: 'Please fill in the Wind Load calculator first to compute wire tensions.',
  loadGoToWindLoad: '→ Wind Load',
  colSectionForce: 'Section Force',
  colHorizPerWire: 'Horiz. per Wire',
  colTension: 'Wire Tension',
  loadDisclaimer: 'Planning estimate only — not a structural analysis. Pre-tension not considered.',
  ```

- [ ] **Step 3: Run lint to check for syntax errors**

  ```bash
  npm run lint
  ```

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add src/i18n/translations.js
  git commit -m "feat(i18n): add load section keys (DE/EN)"
  ```

---

## Task 3: Pure function `guywireload.js` (TDD)

**Files:**
- Create: `tests/guywireload.test.js`
- Create: `src/calculators/guywire/guywireload.js`

- [ ] **Step 1: Create the test file**

  Create `tests/guywireload.test.js`:

  ```js
  import { describe, it, expect } from 'vitest'
  import { calculateGuyWireLoad } from '../src/calculators/guywire/guywireload.js'

  // Helper: build a levelResults entry as calculateGuyWires would produce it
  function makeLevel(height, radius, wires) {
    const wireLength = Math.sqrt(height ** 2 + radius ** 2)
    const angleFromHorizontal = (Math.atan2(height, radius) * 180) / Math.PI
    return { height, radius, wireLength, angleFromHorizontal, wires }
  }

  describe('calculateGuyWireLoad', () => {

    it('returns null when levelResults is null', () => {
      const snapshot = {
        q: 500, windSpeed: 28,
        mastHeight: 10, diamBottomMm: 100, diamTopMm: 60, mastCw: 1.1,
        antennaForce: 0, antennaMountHeight: 9,
      }
      expect(calculateGuyWireLoad({ snapshot, levelResults: null })).toBeNull()
    })

    it('single level — assigns full mast + antenna to level 1', () => {
      // Flat mast (dBot = dTop = 100mm) for easy area calculation
      // H=10m, d=0.1m, cw=1.0, q=1000 N/m²
      // Area = 0.1 × 10 = 1.0 m², F_wind = 1000 N
      // Level: height=8m, radius=6m → wireLength=10m, angleFromHorizontal=53.13°
      // cos(53.13°) = 6/10 = 0.6
      // antennaForce = 200 N → F_total = 1200 N
      // tension = 1200 / (3 × 0.6) = 666.67 N
      const snapshot = {
        q: 1000, windSpeed: 28,
        mastHeight: 10, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
        antennaForce: 200, antennaMountHeight: 9,
      }
      const levelResults = [makeLevel(8, 6, 3)]
      const result = calculateGuyWireLoad({ snapshot, levelResults })

      expect(result).not.toBeNull()
      expect(result.levels).toHaveLength(1)
      expect(result.levels[0].sectionForce).toBeCloseTo(1000, 1)
      expect(result.levels[0].horizForcePerWire).toBeCloseTo(400, 1) // (1000+200)/3
      expect(result.levels[0].tension).toBeCloseTo(666.67, 1)
      expect(result.levels[0].tensionKgf).toBeCloseTo(666.67 / 9.81, 2)
    })

    it('flat mast section area equals rectangle', () => {
      // diamBottom = diamTop = 0.1m → section area = d × length (rectangle)
      const snapshot = {
        q: 1000, windSpeed: 28,
        mastHeight: 10, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
        antennaForce: 0, antennaMountHeight: 9,
      }
      const levelResults = [makeLevel(8, 6, 3)]
      const result = calculateGuyWireLoad({ snapshot, levelResults })
      // F = 1000 × 1.0 × (0.1 × 10) = 1000 N
      expect(result.levels[0].sectionForce).toBeCloseTo(1000, 3)
    })

    it('two levels — correct midpoint split, antenna on top level only', () => {
      // H=12m, flat mast d=0.1m, cw=1.0, q=1000
      // Level 1: h=6m, r=5m, wires=3 → section 0..8.5m → area=0.1×8.5=0.85 → F1=850
      // Level 2: h=11m, r=8m, wires=3 → section 8.5..12m → area=0.1×3.5=0.35 → F2_wind=350
      // antennaForce=100 → F2=450
      // wireLength1=sqrt(61)≈7.810, cosAlpha1=5/7.810≈0.6402 → T1=850/(3×0.6402)≈442.4N
      // wireLength2=sqrt(185)≈13.601, cosAlpha2=8/13.601≈0.5882 → T2=450/(3×0.5882)≈255.0N
      const snapshot = {
        q: 1000, windSpeed: 28,
        mastHeight: 12, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
        antennaForce: 100, antennaMountHeight: 11,
      }
      const levelResults = [makeLevel(6, 5, 3), makeLevel(11, 8, 3)]
      const result = calculateGuyWireLoad({ snapshot, levelResults })

      expect(result.levels).toHaveLength(2)
      expect(result.levels[0].sectionForce).toBeCloseTo(850, 1)
      expect(result.levels[1].sectionForce).toBeCloseTo(350, 1)  // wind only, before antenna
      // antenna added to top level tension
      const cosAlpha2 = 8 / Math.sqrt(185)
      expect(result.levels[1].tension).toBeCloseTo(450 / (3 * cosAlpha2), 1)
      // level 1 gets no antenna
      const cosAlpha1 = 5 / Math.sqrt(61)
      expect(result.levels[0].tension).toBeCloseTo(850 / (3 * cosAlpha1), 1)
    })

    it('three levels — correct three-way split', () => {
      // H=18m, flat d=0.1m, cw=1.0, q=1000, antennaForce=0
      // Levels: h=6,12,17 → midpoints: 9, 14.5
      // Section 1: 0..9m → area=0.9m² → F=900N
      // Section 2: 9..14.5m → area=0.55m² → F=550N
      // Section 3: 14.5..18m → area=0.35m² → F=350N
      const snapshot = {
        q: 1000, windSpeed: 28,
        mastHeight: 18, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
        antennaForce: 0, antennaMountHeight: 17,
      }
      const levelResults = [
        makeLevel(6, 5, 3),
        makeLevel(12, 8, 3),
        makeLevel(17, 10, 3),
      ]
      const result = calculateGuyWireLoad({ snapshot, levelResults })

      expect(result.levels).toHaveLength(3)
      expect(result.levels[0].sectionForce).toBeCloseTo(900, 1)
      expect(result.levels[1].sectionForce).toBeCloseTo(550, 1)
      expect(result.levels[2].sectionForce).toBeCloseTo(350, 1)
    })

    it('antenna always goes to top level regardless of antennaMountHeight', () => {
      const snapshot = {
        q: 1000, windSpeed: 28,
        mastHeight: 12, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
        antennaForce: 500, antennaMountHeight: 3, // below both levels — still goes to top
      }
      const levelResults = [makeLevel(6, 5, 3), makeLevel(11, 8, 3)]
      const result = calculateGuyWireLoad({ snapshot, levelResults })
      // Top level (index 1) tension should include antennaForce=500 in numerator
      const cosAlpha2 = 8 / Math.sqrt(185)
      const F2 = 350 + 500  // sectionForce + antenna
      expect(result.levels[1].tension).toBeCloseTo(F2 / (3 * cosAlpha2), 1)
      // Bottom level should NOT include antenna
      const cosAlpha1 = 5 / Math.sqrt(61)
      expect(result.levels[0].tension).toBeCloseTo(850 / (3 * cosAlpha1), 1)
    })

    it('zero wires guard — returns 0 tension without throwing', () => {
      const snapshot = {
        q: 1000, windSpeed: 28,
        mastHeight: 10, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
        antennaForce: 0, antennaMountHeight: 9,
      }
      const levelResults = [makeLevel(8, 6, 0)]  // wires=0
      expect(() => calculateGuyWireLoad({ snapshot, levelResults })).not.toThrow()
      const result = calculateGuyWireLoad({ snapshot, levelResults })
      expect(result.levels[0].tension).toBe(0)
      expect(result.levels[0].horizForcePerWire).toBe(0)
    })

    it('tensionKgf = tension / 9.81', () => {
      const snapshot = {
        q: 1000, windSpeed: 28,
        mastHeight: 10, diamBottomMm: 100, diamTopMm: 100, mastCw: 1.0,
        antennaForce: 0, antennaMountHeight: 9,
      }
      const levelResults = [makeLevel(8, 6, 3)]
      const result = calculateGuyWireLoad({ snapshot, levelResults })
      expect(result.levels[0].tensionKgf).toBeCloseTo(result.levels[0].tension / 9.81, 5)
    })

  })
  ```

- [ ] **Step 2: Run tests — all new tests must fail (file doesn't exist yet)**

  ```bash
  npm run test -- --reporter=verbose
  ```

  Expected: test file fails to import `calculateGuyWireLoad`.

- [ ] **Step 3: Create `guywireload.js`**

  Create `src/calculators/guywire/guywireload.js`:

  ```js
  /**
   * calculateGuyWireLoad — sectional wind load distribution for guyed masts.
   *
   * @param {object} params
   * @param {object} params.snapshot       - Wind load snapshot from WindLoadCalc
   * @param {number} params.snapshot.q                - Dynamic wind pressure (N/m²)
   * @param {number} params.snapshot.mastHeight       - Mast height (m)
   * @param {number} params.snapshot.diamBottomMm     - Mast base diameter (mm)
   * @param {number} params.snapshot.diamTopMm        - Mast top diameter (mm)
   * @param {number} params.snapshot.mastCw           - Mast drag coefficient
   * @param {number} params.snapshot.antennaForce     - Antenna wind force (N), assigned to top level
   * @param {Array}  params.levelResults  - Level results from calculateGuyWires (must include height, radius, angleFromHorizontal, wires)
   *
   * @returns {{ levels: Array }} | null
   */
  export function calculateGuyWireLoad({ snapshot, levelResults }) {
    if (!levelResults) return null

    const { q, mastHeight: H, diamBottomMm, diamTopMm, mastCw: cw, antennaForce } = snapshot
    const diamBottom = diamBottomMm / 1000
    const diamTop = diamTopMm / 1000
    const N = levelResults.length

    // Linear diameter interpolation at height z
    function diamAtZ(z) {
      return diamBottom + (diamTop - diamBottom) * z / H
    }

    // Trapezoid wind force on mast section from z_a to z_b
    function sectionWindForce(z_a, z_b) {
      const area = (diamAtZ(z_a) + diamAtZ(z_b)) / 2 * (z_b - z_a)
      return q * cw * area
    }

    // Midpoint-rule section boundaries for level i
    function bounds(i) {
      const lower = i === 0 ? 0 : (levelResults[i - 1].height + levelResults[i].height) / 2
      const upper = i === N - 1 ? H : (levelResults[i].height + levelResults[i + 1].height) / 2
      return { lower, upper }
    }

    const levels = levelResults.map((level, i) => {
      const { lower, upper } = bounds(i)
      const windForce = sectionWindForce(lower, upper)
      const totalForce = i === N - 1 ? windForce + antennaForce : windForce

      const cosAlpha = Math.cos(level.angleFromHorizontal * Math.PI / 180)
      const horizForcePerWire = level.wires > 0 ? totalForce / level.wires : 0
      const tension = level.wires > 0 && cosAlpha > 0
        ? totalForce / (level.wires * cosAlpha)
        : 0

      return {
        sectionForce: windForce,
        horizForcePerWire,
        tension,
        tensionKgf: tension / 9.81,
      }
    })

    return { levels }
  }
  ```

- [ ] **Step 4: Run tests — all must pass**

  ```bash
  npm run test -- --reporter=verbose
  ```

  Expected: all tests in `tests/guywireload.test.js` pass.

- [ ] **Step 5: Run lint**

  ```bash
  npm run lint
  ```

  Expected: no errors.

- [ ] **Step 6: Commit**

  ```bash
  git add src/calculators/guywire/guywireload.js tests/guywireload.test.js
  git commit -m "feat(guywire): add calculateGuyWireLoad pure function with tests"
  ```

---

## Task 4: `GuyWireLoad.jsx` component

**Files:**
- Create: `src/calculators/guywire/GuyWireLoad.jsx`

The component receives `windLoadSnapshot` and `geoResults` as props. It renders the empty state when either is absent, or the results table when both are valid.

- [ ] **Step 1: Create `GuyWireLoad.jsx`**

  Create `src/calculators/guywire/GuyWireLoad.jsx`:

  ```jsx
  import { useMemo } from 'react'
  import { useLanguage } from '../../hooks/useLanguage.jsx'
  import { calculateGuyWireLoad } from './guywireload.js'

  const LEVEL_COLORS = ['text-emerald-400', 'text-amber-400', 'text-red-400', 'text-purple-400']

  function fmt(n, decimals = 0) {
    return n.toFixed(decimals)
  }

  export default function GuyWireLoad({ windLoadSnapshot, geoResults, onNavigateToWindLoad }) {
    const { t } = useLanguage()

    const loadResults = useMemo(() => {
      if (!windLoadSnapshot || !geoResults) return null
      try {
        return calculateGuyWireLoad({
          snapshot: windLoadSnapshot,
          levelResults: geoResults.levels,
        })
      } catch {
        return null
      }
    }, [windLoadSnapshot, geoResults])

    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
          {t('loadSectionTitle')}
        </p>

        {!loadResults ? (
          <div className="flex items-center gap-3 border border-dashed border-slate-600 rounded-lg px-4 py-3">
            <span className="text-slate-500 text-lg">⚡</span>
            <p className="text-sm text-slate-400 flex-1">{t('loadRequiredHint')}</p>
            <button
              onClick={onNavigateToWindLoad}
              className="text-xs text-slate-400 hover:text-slate-200 border border-slate-600 hover:border-slate-400 rounded px-2 py-1 transition-colors whitespace-nowrap"
            >
              {t('loadGoToWindLoad')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">
                q = {fmt(windLoadSnapshot.q, 0)} N/m² · v = {fmt(windLoadSnapshot.windSpeed, 0)} m/s
              </span>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-xs text-slate-500">
                  <th className="text-left pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">
                    {t('colLevel')}
                  </th>
                  <th className="text-right pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">
                    {t('colSectionForce')}
                  </th>
                  <th className="text-right pb-2 border-b border-slate-700 pr-3 whitespace-nowrap">
                    {t('colHorizPerWire')}
                  </th>
                  <th className="text-right pb-2 border-b border-slate-700 whitespace-nowrap">
                    {t('colTension')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadResults.levels.map((level, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-slate-900/30' : ''}>
                    <td className={`py-2 pr-3 font-medium ${LEVEL_COLORS[i]}`}>
                      {i + 1}
                    </td>
                    <td className="py-2 pr-3 text-right text-slate-200 whitespace-nowrap">
                      {fmt(level.sectionForce)} N
                    </td>
                    <td className="py-2 pr-3 text-right text-slate-200 whitespace-nowrap">
                      {fmt(level.horizForcePerWire)} N
                    </td>
                    <td className="py-2 text-right text-slate-200 whitespace-nowrap">
                      {fmt(level.tension)} N
                      <span className="text-slate-500 text-xs ml-1">
                        ({fmt(level.tensionKgf, 1)} kg)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-xs text-slate-500 border border-slate-700 rounded-lg px-3 py-2 mt-4 leading-relaxed">
              ⚠️ {t('loadDisclaimer')}
            </p>
          </>
        )}
      </div>
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
  git add src/calculators/guywire/GuyWireLoad.jsx
  git commit -m "feat(guywire): add GuyWireLoad UI component"
  ```

---

## Task 5: Update `WindLoadCalc.jsx` to emit snapshot

**Files:**
- Modify: `src/calculators/windload/WindLoadCalc.jsx`

`WindLoadCalc` receives `onWindLoadChange` as an optional prop (defaults to a no-op). The snapshot is computed alongside `results` in the `useMemo`, and emitted via `useEffect`.

- [ ] **Step 1: Update `WindLoadCalc.jsx`**

  Replace the full file contents of `src/calculators/windload/WindLoadCalc.jsx`:

  ```jsx
  import { useState, useMemo, useEffect } from 'react'
  import WindLoadInputs from './WindLoadInputs.jsx'
  import WindLoadDiagram from './WindLoadDiagram.jsx'
  import WindLoadResults from './WindLoadResults.jsx'
  import { calculateWindLoad } from './windload.js'
  import { useLanguage } from '../../hooks/useLanguage.jsx'

  const DEFAULT_CONFIG = {
    windSpeed: 28,
    gustFactor: 1.7,
    mast: { height: 12, diamBottomMm: 100, diamTopMm: 60, cw: 1.1 },
    antenna: { area: 0.5, cw: 0.8, mountHeight: 11 },
  }

  export default function WindLoadCalc({ onWindLoadChange = () => {} }) {
    const [config, setConfig] = useState(DEFAULT_CONFIG)
    const { t } = useLanguage()

    const memoised = useMemo(() => {
      try {
        const results = calculateWindLoad({
          windSpeed: config.windSpeed,
          gustFactor: config.gustFactor,
          mast: {
            height: config.mast.height,
            diamBottom: config.mast.diamBottomMm / 1000,
            diamTop: config.mast.diamTopMm / 1000,
            cw: config.mast.cw,
          },
          antenna: config.antenna,
        })
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
        return { results, snapshot }
      } catch {
        return null
      }
    }, [config])

    useEffect(() => {
      if (memoised?.snapshot) onWindLoadChange(memoised.snapshot)
    }, [memoised]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <div className="flex flex-col gap-4">
        <WindLoadInputs config={config} onChange={setConfig} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WindLoadDiagram config={config} results={memoised?.results ?? null} />
          <WindLoadResults results={memoised?.results ?? null} />
        </div>

        <p className="text-xs text-slate-500 border border-slate-700 rounded-lg px-4 py-3 leading-relaxed">
          ⚠️ {t('windLoadDisclaimer')}
        </p>
      </div>
    )
  }
  ```

- [ ] **Step 2: Run tests and lint**

  ```bash
  npm run test && npm run lint
  ```

  Expected: all tests pass, no lint errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/calculators/windload/WindLoadCalc.jsx
  git commit -m "feat(windload): emit windLoadSnapshot via onWindLoadChange prop"
  ```

---

## Task 6: Update `GuyWireCalc.jsx` to render `GuyWireLoad`

**Files:**
- Modify: `src/calculators/guywire/GuyWireCalc.jsx`

`GuyWireCalc` receives `windLoadSnapshot` as an optional prop (defaults to `null`) and renders `<GuyWireLoad>` below the existing grid.

- [ ] **Step 1: Update `GuyWireCalc.jsx`**

  Replace the full file contents of `src/calculators/guywire/GuyWireCalc.jsx`:

  ```jsx
  import { useState, useMemo } from 'react'
  import GuyWireInputs from './GuyWireInputs.jsx'
  import GuyWireDiagram from './GuyWireDiagram.jsx'
  import GuyWireResults from './GuyWireResults.jsx'
  import GuyWireLoad from './GuyWireLoad.jsx'
  import { calculateGuyWires } from './guywire.js'

  const DEFAULT_CONFIG = {
    mastHeight: 12,
    levels: 2,
    levelConfig: [
      { height: 6,  radius: 5,  wires: 3 },
      { height: 11, radius: 8,  wires: 3 },
      { height: 0,  radius: 0,  wires: 3 },
    ],
  }

  export default function GuyWireCalc({ windLoadSnapshot = null, onNavigateToWindLoad = () => {} }) {
    const [config, setConfig] = useState(DEFAULT_CONFIG)

    const results = useMemo(() => {
      try {
        return calculateGuyWires(config)
      } catch {
        return null
      }
    }, [config])

    return (
      <div className="flex flex-col gap-4">
        <GuyWireInputs config={config} onChange={setConfig} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GuyWireDiagram config={config} results={results} />
          <GuyWireResults results={results} />
        </div>

        <GuyWireLoad
          windLoadSnapshot={windLoadSnapshot}
          geoResults={results}
          onNavigateToWindLoad={onNavigateToWindLoad}
        />
      </div>
    )
  }
  ```

- [ ] **Step 2: Run tests and lint**

  ```bash
  npm run test && npm run lint
  ```

  Expected: all tests pass, no lint errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/calculators/guywire/GuyWireCalc.jsx
  git commit -m "feat(guywire): render GuyWireLoad section, accept windLoadSnapshot prop"
  ```

---

## Task 7: Update `App.jsx` — shared state and per-key render

**Files:**
- Modify: `src/App.jsx`

Add `windLoadSnapshot` state, replace the generic `<ActiveCalc />` render with per-key rendering that injects the correct props, and bump the version badge to `v0.3.0`.

- [ ] **Step 1: Update `App.jsx`**

  Replace the full file contents of `src/App.jsx`:

  ```jsx
  import { useState } from 'react'
  import { useLanguage } from './hooks/useLanguage.jsx'
  import Sidebar from './components/Sidebar.jsx'
  import GuyWireCalc from './calculators/guywire/GuyWireCalc.jsx'
  import WindLoadCalc from './calculators/windload/WindLoadCalc.jsx'

  export default function App() {
    const [activeCalc, setActiveCalc] = useState('guywire')
    const [windLoadSnapshot, setWindLoadSnapshot] = useState(null)
    const { t, toggleLang } = useLanguage()

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 text-xl">📡</span>
            <span className="font-semibold text-slate-100">{t('appTitle')}</span>
            <span className="text-xs text-slate-500 font-mono">v0.3.0</span>
          </div>
          <button
            onClick={toggleLang}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1 rounded-full transition-colors"
          >
            {t('langToggle')}
          </button>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeCalc={activeCalc} onSelect={setActiveCalc} />
          <main className="flex-1 overflow-auto p-4">
            {activeCalc === 'guywire' && (
              <GuyWireCalc
                windLoadSnapshot={windLoadSnapshot}
                onNavigateToWindLoad={() => setActiveCalc('windload')}
              />
            )}
            {activeCalc === 'windload' && (
              <WindLoadCalc onWindLoadChange={setWindLoadSnapshot} />
            )}
          </main>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 2: Run all tests and lint**

  ```bash
  npm run test && npm run lint
  ```

  Expected: all tests pass, no lint errors.

- [ ] **Step 3: Start dev server and do manual integration test**

  ```bash
  npm run dev
  ```

  Open http://localhost:5173 and verify:
  1. Guy Wire Calculator shows the `Belastungsberechnung` section with the empty-state hint
  2. Switch to Wind Load Calculator — fill in any values
  3. Switch back to Guy Wire Calculator — the section now shows the load results table with tension in N and kgf
  4. Change wind speed in Wind Load calc, switch back — values update
  5. Toggle DE/EN — all labels translate correctly
  6. Version badge shows `v0.3.0`

- [ ] **Step 4: Stop dev server, run full test suite and lint one final time**

  ```bash
  npm run test && npm run lint
  ```

  Expected: all tests pass, no lint errors.

- [ ] **Step 5: Commit**

  ```bash
  git add src/App.jsx
  git commit -m "feat: v0.3.0 — guy wire load calculation"
  ```
