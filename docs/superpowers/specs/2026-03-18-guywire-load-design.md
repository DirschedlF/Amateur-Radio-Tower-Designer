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

`WindLoadCalc` receives an `onWindLoadChange` prop and calls it whenever its results change (inside the existing `useMemo` result, via `useEffect`):

```js
// WindLoadCalc.jsx
useEffect(() => {
  if (results) onWindLoadChange({ q: results.q, ...derivedSnapshot })
}, [results])
```

`GuyWireCalc` receives `windLoadSnapshot` as a prop and passes it to the new `GuyWireLoad` child component.

### Snapshot Shape

```js
{
  q: number,              // dynamic wind pressure (N/m²)
  mastHeight: number,     // mast height (m)
  diamBottomMm: number,   // mast diameter at base (mm)
  diamTopMm: number,      // mast diameter at top (mm)
  mastCw: number,         // mast drag coefficient
  antennaForce: number,   // total antenna wind force (N), already computed
  antennaMountHeight: number, // antenna aerodynamic centre height (m)
}
```

Mast diameters are stored in mm (same convention as `WindLoadCalc` internal state); `guywireload.js` divides by 1000 before use.

## Physics Model — Sectional Method (Abschnittsmethode)

### Section Boundaries (midpoint rule)

Given N guy wire levels at heights h₁ < h₂ < … < h_N and mast total height H:

| Level | Lower boundary | Upper boundary |
|-------|---------------|----------------|
| 1 | 0 | (h₁ + h₂) / 2 |
| i (middle) | (h_{i-1} + h_i) / 2 | (h_i + h_{i+1}) / 2 |
| N (top) | (h_{N-1} + h_N) / 2 | H |

For a single level (N = 1): the entire mast height is assigned to level 1.

### Wind Force per Section

The mast is conical (linear diameter interpolation). For a section from z_a to z_b:

```
d(z) = diamBottom + (diamTop - diamBottom) × z / H

d_a = d(z_a),  d_b = d(z_b)
A_section = (d_a + d_b) / 2 × (z_b - z_a)     // trapezoid area
F_section = q × cw × A_section
```

### Antenna Force

The full antenna force (`antennaForce` from the snapshot) is added to the **topmost** guy wire level. This is conservative and correct for the common case where the antenna is mounted at or above the top attachment point.

### Wire Tension

For level i with section force F_i (including antenna if top level), n_i wires, and wire angle from horizontal α_i (already computed by the geometry calculator):

```
T_i = F_i / (n_i × cos(α_i))
```

`cos(α_i) = radius_i / wireLength_i` — both values are available from `calculateGuyWires` results.

The result also exposes:
- `sectionForce` (N) — wind force assigned to this level
- `horizForcePerWire` (N) — horizontal component per wire = F_i / n_i
- `tension` (N) — wire tension
- `tensionKgf` (kgf) — wire tension in kilogram-force = tension / 9.81

## UI

### Empty State (no `windLoadSnapshot`)

A dashed placeholder block below the existing results table:

```
⚡  Belastungsberechnung
   Bitte zuerst den Windlast-Rechner ausfüllen, um die Drahtspannungen zu berechnen.
                                              [→ Windlast-Rechner]  (link/button)
```

### Active State (snapshot available)

A panel with:
- Header row: `BELASTUNGSBERECHNUNG` label + small info text showing `q = … N/m² · v = … m/s` + `↺ Aktualisieren` button (re-triggers snapshot read — useful if user updated Wind Load and came back)
- Results table:

| Ebene | Abschnittskraft | Horiz. je Draht | Drahtspannung |
|-------|----------------|-----------------|---------------|
| 1 | 312 N | 104 N | 133 N (13.6 kg) |
| 2 | 489 N | 163 N | 198 N (20.2 kg) |

- Level numbers are color-coded to match the existing geometry table (emerald / amber / red)
- Disclaimer (same style as Wind Load Calculator): "Planungsschätzung — keine statische Auslegung. Vorspannkraft nicht berücksichtigt."

### Layout Rule

The `GuyWireLoad` panel follows the same full-width pattern as the rest of `GuyWireCalc` (no `max-w-*`). Table headers and tension cells use `whitespace-nowrap`.

## i18n Keys (DE / EN)

| Key | DE | EN |
|-----|----|----|
| `loadSectionTitle` | Belastungsberechnung | Load Analysis |
| `loadRequiredHint` | Bitte zuerst den Windlast-Rechner ausfüllen. | Please fill in the Wind Load calculator first. |
| `loadGoToWindLoad` | → Windlast-Rechner | → Wind Load |
| `loadRefresh` | ↺ Aktualisieren | ↺ Refresh |
| `colSectionForce` | Abschnittskraft | Section Force |
| `colHorizPerWire` | Horiz. je Draht | Horiz. per Wire |
| `colTension` | Drahtspannung | Wire Tension |
| `loadDisclaimer` | Planungsschätzung — keine statische Auslegung. Vorspannkraft nicht berücksichtigt. | Planning estimate only — not a structural analysis. Pre-tension not considered. |

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
| `src/App.jsx` | Add `windLoadSnapshot` state; pass `onWindLoadChange` to `WindLoadCalc`; pass `windLoadSnapshot` to `GuyWireCalc` |
| `src/calculators/windload/WindLoadCalc.jsx` | Accept `onWindLoadChange` prop; call it via `useEffect` when `results` changes |
| `src/calculators/guywire/GuyWireCalc.jsx` | Accept `windLoadSnapshot` prop; render `<GuyWireLoad>` below existing layout |
| `src/i18n/translations.js` | Add new keys listed above |

## Testing

`tests/guywireload.test.js` covers:
- Single level: full mast wind force → correct tension
- Two levels: correct section split at midpoint, antenna on top level
- Three levels: correct three-way split
- Zero wire count guard (no division by zero)
- Flat mast (diamBottom = diamTop): section force equals rectangular area

## Out of Scope (v0.3.0)

- Wire pre-tension / initial tension
- Safety factor check against wire breaking strength
- Dynamic / seismic loads
- Fixed-base mast moment resistance
