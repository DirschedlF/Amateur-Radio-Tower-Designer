# Guy-Wire Load Calculation — Design Spec (v0.3.0)

## Overview

Extend the Amateur Radio Tower Designer with a guy wire tension calculator. The feature links the existing Wind Load Calculator with the Guy Wire Calculator: once the user has filled in both, a new section in the Guy Wire Calculator shows the tension per wire per level under wind load.

## User Workflow

1. Enter guy wire geometry in the **Guy Wire Calculator** (mast height, levels, per-level height / anchor radius / wire count)
2. Fill in the **Wind Load Calculator** (wind speed, mast geometry, antenna data)
3. Return to the **Guy Wire Calculator** — a new **Belastungsberechnung** section appears below the existing results table and shows wire tensions

## Data Flow & Architecture

### Shared State

`App.jsx` gains a new `windLoadSnapshot` state (initially `null`). This is the only new shared state in the application.

```js
const [windLoadSnapshot, setWindLoadSnapshot] = useState(null)
```

`WindLoadCalc` receives an `onWindLoadChange` prop. This prop is passed as the `setWindLoadSnapshot` setter directly from `App.jsx` — the `useState` setter is stable by identity and does not require `useCallback`. `WindLoadCalc` calls it inside the existing `useMemo` block: the snapshot is computed together with `results` and returned as part of the memoised value, then passed up via a `useEffect` on that memoised value:

```js
// WindLoadCalc.jsx — inside useMemo
return { results, snapshot: { q: results.q, windSpeed: config.windSpeed, ... } }

// then:
useEffect(() => {
  if (memoised?.snapshot) onWindLoadChange(memoised.snapshot)
}, [memoised])
```

`GuyWireCalc` receives `windLoadSnapshot` as a prop and passes it to the new `GuyWireLoad` child component.

### App.jsx Render Pattern

`App.jsx` currently renders the active calculator generically. The render site must be updated to inject calculator-specific props per key:

```jsx
// Before
{ActiveCalc && <ActiveCalc />}

// After
{activeCalc === 'guywire' && (
  <GuyWireCalc windLoadSnapshot={windLoadSnapshot} />
)}
{activeCalc === 'windload' && (
  <WindLoadCalc onWindLoadChange={setWindLoadSnapshot} />
)}
```

This replaces the generic `CALC_COMPONENTS[activeCalc]` dynamic render for these two calculators. If further calculators are added in the future, the pattern is extended in the same way.

### Snapshot Shape

```js
{
  q: number,                  // dynamic wind pressure (N/m²)
  windSpeed: number,          // wind speed (m/s) — used for UI display
  mastHeight: number,         // mast height (m)
  diamBottomMm: number,       // mast diameter at base (mm)
  diamTopMm: number,          // mast diameter at top (mm)
  mastCw: number,             // mast drag coefficient
  antennaForce: number,       // total antenna wind force (N), already computed
  antennaMountHeight: number, // antenna aerodynamic centre height (m) — stored for completeness; not used in load formula
}
```

Mast diameters are stored in mm (same convention as `WindLoadCalc` internal state); `guywireload.js` divides by 1000 before use.

## Changes to `guywire.js`

`calculateGuyWires` currently does not forward `height` and `radius` into each level result object. These are required by `guywireload.js` for section boundary computation. Each level result must be extended:

```js
return {
  height,              // NEW — attachment height (m)
  radius,              // NEW — anchor radius (m)
  wireLength,
  angleFromHorizontal,
  angleFromMast,
  totalLengthPerLevel,
  wires,
}
```

This is a non-breaking additive change. Existing consumers (`GuyWireDiagram`, `GuyWireResults`) are unaffected. Unit tests must be updated to assert these new fields.

## Physics Model — Sectional Method (Abschnittsmethode)

### Section Boundaries (midpoint rule)

Given N guy wire levels at attachment heights h₁ < h₂ < … < h_N and mast total height H:

| Level | Lower boundary | Upper boundary | Note |
| ----- | ------------- | -------------- | ---- |
| 1 | 0 | (h₁ + h₂) / 2 | N ≥ 2 only |
| i (middle) | (h_{i-1} + h_i) / 2 | (h_i + h_{i+1}) / 2 | |
| N (top) | (h_{N-1} + h_N) / 2 | H | N ≥ 2 only |
| — | 0 | H | N = 1: entire mast assigned to level 1 |

### Wind Force per Section

The mast is conical (linear diameter interpolation). For a section from z_a to z_b:

```
d(z) = diamBottom + (diamTop - diamBottom) × z / H

d_a = d(z_a),  d_b = d(z_b)
A_section = (d_a + d_b) / 2 × (z_b - z_a)     // trapezoid area
F_section = q × cw × A_section
```

### Antenna Force

The full `antennaForce` from the snapshot is added to the **topmost** guy wire level, regardless of `antennaMountHeight`. This is conservative and correct for the common case where the antenna is at or above the top attachment point. For the uncommon case where the antenna is below the top level, the same rule applies — the assignment is always to the top level. `antennaMountHeight` is stored in the snapshot for future use but is not used in the current formula.

### Wire Tension

`cos(α_i)` is computed as `Math.cos(angleFromHorizontal_i × π / 180)` using the angle already present in the geometry results (equivalent to `radius_i / wireLength_i`).

For level i with section force F_i (including antenna force if top level), n_i wires:

```
T_i = F_i / (n_i × cos(α_i))
```

The result object per level:

```js
{
  sectionForce: number,       // wind force assigned to this level (N)
  horizForcePerWire: number,  // horizontal component per wire = F_i / n_i (N)
  tension: number,            // wire tension (N)
  tensionKgf: number,         // wire tension in kgf = tension / 9.81
}
```

## UI

### Empty State (no `windLoadSnapshot` or `geoResults === null`)

A dashed placeholder block below the existing results table. This state also applies when `geoResults` is `null` (geometry calculation failed).

```
⚡  Belastungsberechnung
   Bitte zuerst den Windlast-Rechner ausfüllen, um die Drahtspannungen zu berechnen.
                                              [→ Windlast-Rechner]  (link/button)
```

### Active State (snapshot available and `geoResults` valid)

A panel with:

- Header row: `BELASTUNGSBERECHNUNG` label + small info text showing `q = … N/m² · v = … m/s` (both from snapshot)
- Results table (updates live whenever snapshot or geometry changes — no manual refresh button needed):

| Ebene | Abschnittskraft | Horiz. je Draht | Drahtspannung |
|-------|----------------|-----------------|---------------|
| 1 | 312 N | 104 N | 133 N (13.6 kg) |
| 2 | 489 N | 163 N | 198 N (20.2 kg) |

- Level numbers are color-coded to match the existing geometry table (emerald / amber / red)
- Disclaimer (same style as Wind Load Calculator): "Planungsschätzung — keine statische Auslegung. Vorspannkraft nicht berücksichtigt."

### Layout Rule

The `GuyWireLoad` panel follows the same full-width pattern as the rest of `GuyWireCalc` (no `max-w-*`). Table headers and tension cells use `whitespace-nowrap`.

## i18n Keys (DE / EN)

| Key | DE | EN | Note |
| --- | -- | -- | ---- |
| `loadSectionTitle` | Belastungsberechnung | Load Analysis | new |
| `loadRequiredHint` | Bitte zuerst den Windlast-Rechner ausfüllen. | Please fill in the Wind Load calculator first. | new |
| `loadGoToWindLoad` | → Windlast-Rechner | → Wind Load | new |
| `colSectionForce` | Abschnittskraft | Section Force | new |
| `colHorizPerWire` | Horiz. je Draht | Horiz. per Wire | new |
| `colTension` | Drahtspannung | Wire Tension | new |
| `loadDisclaimer` | Planungsschätzung — keine statische Auslegung. Vorspannkraft nicht berücksichtigt. | Planning estimate only — not a structural analysis. Pre-tension not considered. | new |
| `colLevel` | — | — | **reuse** existing key, no change needed |

## Files

### New files

| File | Purpose |
|------|---------|
| `src/calculators/guywire/guywireload.js` | Pure function `calculateGuyWireLoad({ snapshot, levelResults })` — no React |
| `src/calculators/guywire/GuyWireLoad.jsx` | UI component — receives `windLoadSnapshot` + `geoResults` as props |
| `tests/guywireload.test.js` | Unit tests for `calculateGuyWireLoad` |

### Modified files

| File | Change |
|------|--------|
| `src/calculators/guywire/guywire.js` | Add `height` and `radius` to each level result object |
| `src/App.jsx` | Add `windLoadSnapshot` state; replace generic render with per-key render; pass `onWindLoadChange` / `windLoadSnapshot` props |
| `src/calculators/windload/WindLoadCalc.jsx` | Accept `onWindLoadChange` prop; compute snapshot inside `useMemo`; call prop via `useEffect` |
| `src/calculators/guywire/GuyWireCalc.jsx` | Accept `windLoadSnapshot` prop; render `<GuyWireLoad>` below existing layout |
| `src/i18n/translations.js` | Add new keys listed above |
| `tests/guywire.test.js` | Update existing tests to assert `height` and `radius` in level results |

## Testing

`tests/guywireload.test.js` covers:

- Single level (N=1): full mast wind force → correct tension
- Two levels (N=2): correct section split at midpoint; antenna on top level
- Three levels (N=3): correct three-way split
- Antenna force adds to top level regardless of `antennaMountHeight`
- Zero wire count guard (no division by zero)
- Flat mast (`diamBottom === diamTop`): section force equals rectangular area
- `geoResults === null`: function returns `null` (caller renders empty state)

## Out of Scope (v0.3.0)

- Wire pre-tension / initial tension
- Safety factor check against wire breaking strength
- Dynamic / seismic loads
- Fixed-base mast moment resistance
- Antenna force distributed by height (always top level)
